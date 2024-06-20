import { Worker, Job } from 'bullmq';
import redis from '../config/redis';
import { splitText } from '../queues';
import discord from '../discord';
import opensearch from '../opensearch';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pdf } from 'pdf-to-img';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import { askVision, askSchema } from '../openai';
import { v4 as uuidv4 } from 'uuid';

// Hantera ES6-modulens __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class JobData extends Job {
  declare data: {
    url: string;
    threadId: string;
  };
}

const worker = new Worker(
  'visionPDF',
  async (job: JobData) => {
    console.log('Running visionPDF');
    const { url } = job.data;

    job.log(`Downloading from url: ${url}`);
    const message = await discord.sendMessage(job.data, `🤖 Laddar ner PDF...`);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; SM-G996U Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36',
        },
      });
      if (!response.ok) {
        await discord.sendMessage(
          job.data,
          `Nedladdning misslyckades: ${response.statusText}`
        );
        throw new Error(`Nedladdning misslyckades: ${response.statusText}`);
      }
      message?.edit(`🤖 Tolkar PDF...`);

      const buffer = await response.arrayBuffer();
      const tempDir = join(__dirname, '..', 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      const pdfPath = join(tempDir, 'temp.pdf');
      await writeFile(pdfPath, Buffer.from(buffer));

      const images = await pdf(pdfPath, { scale: 3 });

      const imagePaths = [];
      for await (const image of images) {
        const imagePath = join(tempDir, `${uuidv4()}.png`);
        await fs.writeFile(imagePath, image);
        imagePaths.push(imagePath);
        message?.edit(
          `🤖 Skapar bild ... (${imagePaths.length}/${images.length})`
        );
      }

      message.edit(
        `✅ PDF nedladdad och uppdelad i ${imagePaths.length} bilder!`
      );

      message.edit(
        `✅ Frågar AI vad bilden är.`
      );

      discord.sendTyping(job.data);

      // Skicka alla förfrågningar samtidigt
      const imageRequests = imagePaths.map(async (imagePath) => {
        const blob = await fs.readFile(imagePath);
        const base64 = Buffer.from(blob).toString('base64');
        const result = await askVision(base64);
        const answer = result.choices[0].message.content;

        await discord.sendFile(job.data, imagePath);
        await discord.sendMessage(job.data, `AI svar längd: ${answer.length}`);
        return answer;
      });

      const answers = await Promise.all(imageRequests);

      console.log(answers);
      console.log(JSON.stringify(answers));
      //Cooldown message

      const afterVisionMessages = await discord.sendMessage(job.data, `🧊 Kyler ner AI kluster..`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      afterVisionMessages.edit(`🤖 Summerar innehållet..`);

      const summary = await askSchema(
        [
          {
            role: 'system',
            content:
              'You are an expert in CSRD reporting. Be accurate and follow the instructions carefully. You are formatting a JSON object.',
          },
          { role: 'user', content: `Fill the schema with this JSON data where it's applicable, if you don't know what to type, make the value null. Here is the JSON data: ${JSON.stringify(answers)}.` },
        ].filter((m) => m.content) as any[]
      );

      afterVisionMessages.edit(
        `✅ Summering klar!`
      );

      const jsonResponse = JSON.parse(summary.choices[0].message.function_call.arguments);
      console.log(jsonResponse);

      for (const imagePath of imagePaths) {
        //await discord.sendFile(job.data, imagePath);
      }

      return imagePaths;
    } catch (error) {
      discord.sendMessage(
        job.data,
        `Fel vid nedladdning av PDF: ${error.message}`
      );
      job.log(`Error downloading PDF: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

export default worker;
