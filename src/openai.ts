import { assert } from 'console'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

const ask = async (messages: ChatCompletionMessageParam[]) => {
  const response = await openai.chat.completions.create({
    messages: messages.filter((m) => m.content),
    model: 'gpt-4o',
    temperature: 0.1,
    stream: false,
  })

  return response.choices[0].message.content
}

const askPrompt = async (prompt: string, constring: string) => {
  assert(prompt, 'Prompt is required')
  assert(constring, 'Constring is required')
  return await ask([
    {
      role: 'system',
      content: 'You are a friendly expert. Be concise and accurate.',
    },
    { role: 'user', content: prompt },
    { role: 'assistant', content: 'Sure! Just send me the constring?' },
    { role: 'user', content: constring },
  ])
}

const askStream = async (
  messages: ChatCompletionMessageParam[],
  onParagraph?
) => {
  console.log("Ask Stream");

  const stream = await openai.chat.completions.create({
    messages: messages.filter((m) => m.content),
    model: 'gpt-4o',
    temperature: 0.1,
    stream: true,
    response_format: {
      type: 'json_object',
    },
  })

  let response = ''
  let paragraph = ''
  for await (const part of stream) {
    const chunk = part.choices[0]?.delta?.content || ''
    response += chunk
    paragraph += chunk
    if (onParagraph && chunk.includes('\n')) {
      onParagraph(response, paragraph)
      paragraph = ''
    }
  }
  // send the rest if there is any
  if (onParagraph && paragraph) onParagraph(response, paragraph)

  return response
}

const reportSchema = {
  "type": "object",
  "properties": {
    "companyName": { "type": "string", "description": "The name of the company" },
    "wikidataId": { "type": "string", "description": "The Wikidata ID of the company" },
    "description": { "type": "string", "description": "A brief description of the company" },
    "fiscalYear": {
      "type": "object",
      "description": "The fiscal year of the company",
      "properties": {
        "startMonth": { "type": "number", "description": "The starting month of the fiscal year" },
        "endMonth": { "type": "number", "description": "The ending month of the fiscal year" }
      },
      "required": ["startMonth", "endMonth"]
    },
    "industryGics": {
      "type": "object",
      "description": "The GICS (Global Industry Classification Standard) classification of the company",
      "properties": {
        "name": { "type": "string", "description": "The name of the GICS classification" },
        "sector": {
          "type": "object",
          "description": "The GICS sector of the company",
          "properties": {
            "code": { "type": "string", "description": "The code of the GICS sector" },
            "name": { "type": "string", "description": "The name of the GICS sector" }
          }
        },
        "group": {
          "type": "object",
          "description": "The GICS group of the company",
          "properties": {
            "code": { "type": "string", "description": "The code of the GICS group" },
            "name": { "type": "string", "description": "The name of the GICS group" }
          }
        },
        "industry": {
          "type": "object",
          "description": "The GICS industry of the company",
          "properties": {
            "code": { "type": "string", "description": "The code of the GICS industry" },
            "name": { "type": "string", "description": "The name of the GICS industry" }
          }
        },
        "subIndustry": {
          "type": "object",
          "description": "The GICS sub-industry of the company",
          "properties": {
            "code": { "type": "string", "description": "The code of the GICS sub-industry" },
            "name": { "type": "string", "description": "The name of the GICS sub-industry" }
          }
        }
      },
      "required": ["name", "sector", "group", "industry", "subIndustry"]
    },
    "industryNace": {
      "type": "object",
      "description": "The NACE (Statistical Classification of Economic Activities in the European Community) classification of the company",
      "properties": {
        "section": {
          "type": "object",
          "description": "The NACE section of the company",
          "properties": {
            "code": { "type": "string", "description": "The code of the NACE section" },
            "name": { "type": "string", "description": "The name of the NACE section" }
          }
        },
        "division": {
          "type": "object",
          "description": "The NACE division of the company",
          "properties": {
            "code": { "type": "string", "description": "The code of the NACE division" },
            "name": { "type": "string", "description": "The name of the NACE division" }
          }
        }
      },
      "required": ["section", "division"]
    },
    "baseYear": { "type": "string", "description": "The base year for emissions data" },
    "url": { "type": "string", "description": "The URL of the company's website" },

    "initiatives": {
      "type": "array",
      "description": "The sustainability initiatives of the company",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string", "description": "A description of the initiative" },
          "title": { "type": "string", "description": "The title of the initiative" },
          "scope": { "type": "string", "description": "The scope of the initiative" },
          "year": { "type": "string", "description": "The year of the initiative" }
        },
        "required": ["description", "title", "scope", "year"]
      }
    },

    "goals": {
      "type": "array",
      "description": "The sustainability goals of the company",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string", "description": "A description of the goal" },
          "year": { "type": "string", "description": "The year of the goal" },
          "target": { "type": "number", "description": "The target value of the goal" },
          "baseYear": { "type": "string", "description": "The base year for the goal" }
        },
        "required": ["description", "year", "target", "baseYear"]
      }
    },
    "factors": {
      "type": "array",
      "description": "The emission factors of the company",
      "items": {
        "type": "object",
        "properties": {
          "product": { "type": "string", "description": "The product associated with the emission factor" },
          "description": { "type": "string", "description": "A description of the emission factor" },
          "value": { "type": "number", "description": "The value of the emission factor" },
          "unit": { "type": "string", "description": "The unit of the emission factor" }
        },
        "required": ["product", "description", "value", "unit"]
      }
    },
    "baseFacts": {
      "type": "object",
      "description": "The base facts of the company",
      "properties": {
        "*": {
          "type": "object",
          "properties": {
            "year": { "type": "string", "description": "The year of the base fact" },
            "turnover": { "type": "number", "description": "The turnover of the company" },
            "unit": { "type": "string", "description": "The unit of the turnover" },
            "employees": { "type": "number", "description": "The number of employees of the company" }
          },
          "required": ["year", "turnover", "unit", "employees"]
        }
      }
    },
    "emissions": {
      "type": "object",
      "description": "The emissions data of the company",
      "properties": {
        "*": {
          "type": "object",
          "properties": {
            "year": { "type": "string", "description": "The year of the emissions data" },
            "scope1": {
              "description": "Scope 1 emissions data",
              "properties": {
                "emissions": { "type": "number", "description": "The amount of Scope 1 emissions" },
                "verified": { "type": "string", "description": "The verification status of Scope 1 emissions" },
                "biogenic": { "type": "number", "description": "The amount of biogenic Scope 1 emissions" },
                "unit": { "type": "string", "description": "The unit of Scope 1 emissions" }
              },
              "required": ["emissions", "verified", "biogenic", "unit"]
            },
            "scope2": {
              "description": "Scope 2 emissions data",
              "properties": {
                "emissions": { "type": "number", "description": "The amount of Scope 2 emissions" },
                "verified": { "type": "string", "description": "The verification status of Scope 2 emissions" },
                "biogenic": { "type": "number", "description": "The amount of biogenic Scope 2 emissions" },
                "unit": { "type": "string", "description": "The unit of Scope 2 emissions" },
                "mb": { "type": "number", "description": "The market-based Scope 2 emissions" },
                "lb": { "type": "number", "description": "The location-based Scope 2 emissions" }
              },
              "required": ["emissions", "verified", "biogenic", "unit", "mb", "lb"]
            },
            "scope3": {
              "description": "Scope 3 emissions data",
              "properties": {
                "emissions": { "type": "number", "description": "The amount of Scope 3 emissions" },
                "verified": { "type": "string", "description": "The verification status of Scope 3 emissions" },
                "biogenic": { "type": "number", "description": "The amount of biogenic Scope 3 emissions" },
                "unit": { "type": "string", "description": "The unit of Scope 3 emissions" },
                "baseYear": { "type": "string", "description": "The base year for Scope 3 emissions" },
                "categories": {
                  "description": "The categories of Scope 3 emissions",
                  "properties": {
                    "1_purchasedGoods": { "type": "number", "description": "Scope 3 emissions from purchased goods and services" },
                    "2_capitalGoods": { "type": "number", "description": "Scope 3 emissions from capital goods" },
                    "3_fuelAndEnergyRelatedActivities": {
                      "type": "number",
                      "description": "Scope 3 emissions from fuel and energy related activities"
                    },
                    "4_upstreamTransportationAndDistribution": {
                      "type": "number",
                      "description": "Scope 3 emissions from upstream transportation and distribution"
                    },
                    "5_wasteGeneratedInOperations": {
                      "type": "number",
                      "description": "Scope 3 emissions from waste generated in operations"
                    },
                    "6_businessTravel": { "type": "number", "description": "Scope 3 emissions from business travel" },
                    "7_employeeCommuting": { "type": "number", "description": "Scope 3 emissions from employee commuting" },
                    "8_upstreamLeasedAssets": {
                      "type": "number",
                      "description": "Scope 3 emissions from upstream leased assets"
                    },
                    "9_downstreamTransportationAndDistribution": {
                      "type": "number",
                      "description": "Scope 3 emissions from downstream transportation and distribution"
                    },
                    "10_processingOfSoldProducts": {
                      "type": "number",
                      "description": "Scope 3 emissions from processing of sold products"
                    },
                    "11_useOfSoldProducts": { "type": "number", "description": "Scope 3 emissions from use of sold products" },
                    "12_endOfLifeTreatmentOfSoldProducts": {
                      "type": "number",
                      "description": "Scope 3 emissions from end-of-life treatment of sold products"
                    },
                    "13_downstreamLeasedAssets": {
                      "type": "number",
                      "description": "Scope 3 emissions from downstream leased assets"
                    },
                    "14_franchises": { "type": "number", "description": "Scope 3 emissions from franchises" },
                    "15_investments": { "type": "number", "description": "Scope 3 emissions from investments" },
                    "16_other": { "type": "number", "description": "Other Scope 3 emissions" }
                  }
                }
              },
              "required": ["emissions", "verified", "biogenic", "unit", "baseYear", "categories"]
            },
            "totalEmissions": { "type": "number", "description": "The total emissions of the company" },
            "totalUnit": { "type": "string", "description": "The unit of the total emissions" }
          }
        }
      }
    },
    "contacts": {
      "type": "object",
      "description": "The contacts of the company",
      "properties": {
        "*": {
          "type": "object",
          "properties": {
            "name": { "type": "string", "description": "The name of the contact" },
            "role": { "type": "string", "description": "The role of the contact" },
            "email": { "type": "string", "description": "The email of the contact" },
            "phone": { "type": "string", "description": "The phone number of the contact" }
          },
          "required": ["name", "role", "email", "phone"]
        }
      }
    },
  },
  "required": ["companyName", "wikidataId", "description", "fiscalYear", "industryGics", "industryNace", "baseYear", "url", "initiatives", "goals", "factors", "baseFacts", "emissions", "contacts"],
  "description": "Schema for CSRD reporting"
}


const askSchema = async (
  messages: ChatCompletionMessageParam[]
) => {
  console.log("Ask Schema");
  const response = await openai.chat.completions.create({
    messages: messages.filter((m) => m.content),
    model: 'gpt-4o',
    temperature: 0.1,
    stream: false,
    functions: [{ name: "csrd_report", parameters: reportSchema }],
    function_call: { name: "csrd_report" }
  })

  return response
}

const askVision = async (image: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        "role": "user",
        "content": [
          {
            "type": "text", "text": `
            Här är en bild från en hållbarhetsrapport.
            Samla intressant data för att skapa en CSRD-rapport.
            Informationen ska vara kortfattad.
            Svara endast i JSON.
            ` },
          {
            "type": "image_url",
            "image_url": {
              "url": `data:image/jpeg;base64,${image}`
            },
          },
        ],
      }
    ],
    temperature: 0.1,
    response_format: {
      type: 'json_object',
    },
  })

  return response
}

export { ask, askPrompt, askStream, askSchema, askVision }
