[1] Prompt
[1] I have previously sent a text for analysis by GPT-4. The responses I received needs to be verified and corrected according to a schema to be able to save to the db. Below are your instructions.
[1]
[1] You are now in the step H of the process that starts with raw extraction and then more detailed extraction so please keep the most relevant data from the previous steps in mind and make sure to include it in the final output in the correct format.
[1] ```mermaid
[1] flowchart TB
[1]
[1]     A[PDF]
[1]     B{Is in cache?}
[1]     C[Download PDF]
[1]     D[Index Database]
[1]     E[Search Database]
[1]     F[Extract Emissions]
[1]     G[JSON]
[1]
[1]     Industry[Extract Industry]
[1]     Goals[Extract Climate Goals]
[1]     Review[Reasonability Assessment]
[1]
[1]
[1]     DB[OpenSearch/Kibana]
[1]
[1]     A --> B --> C --> D --> E ---> F ---> G ---> H
[1]     B --(Cached)--> E
[1]
[1]     F --> CompanyName --(.company)--> G
[1]     F --> Industry --(.industry)--> G
[1]     F --> Scope1+2 --(.scope1)--> G
[1]     F --> Scope3 --(.scope3)--> G
[1]     F --> Goals --(.goals)--> G
[1]     F --> Initiatives --(.initiatives)--> G
[1]     F --> Contacts --(.contacts)--> G
[1]     F --> Turnover --(.turnover)--> G
[1]     F --> Factors --(.factors)--> G
[1]     F --> Wikidata --(.wikidata)--> G
[1]
[1]     G --> Format --(json)--> H
[1]
[1]     H --> Review --> DB
[1]     H --> Review --> DB
[1] ```
[1]
[1] **Data Output Format**:
[1] Present the extracted data in a structured JSON format, including all information you have recieved from the previous steps. Never include any comments in the JSON output.
[1]
[1] **NEVER USE N/A or similar**
[1] If a value is not available, report it as null or remove the field. For scope3 categories, you don't need to include the category if the value is null.
[1]
[1] **Fiscal Year**:
[1] If the fiscal year is broken, please use the latest year as key when presenting the data. For example: emissions for 2021/2022 should be presented under the key "2022". Specify the fiscal year in the JSON output.
[1]
[1] **Units**:
[1] If conversion is needed when extracting the data, you are only allowed to convert between different scales of the same
[1] unit but never summarize or merge two fields into one or convert between different currencies. For example, if the data is in MSEK, GSEK, MUSD, MEUR etc
[1] you should convert it to base currency (SEK, USD, EUR). If the emissions are in giga tonnes CO2 (or similar), you should
[1] convert it to tCO2e (metric tonnes CO2e).
[1]
[1] **Data Schema**:
[1] This is the elastic schema that will be used to index the results. Make sure to follow this precisely, making sure each value is the correct data type.
[1] If the input doesn't match the data type, convert it (from string to number or vice versa) even if it means setting it to null.    
[1] If the input doesn't have a value, please make sure to set it to null or an empty string (according to the mappings).
[1] Every property should be present in the output, make especially sure to include all the properties in the emission categories.     
[1]
[1] *** Avoid formatting errors***
[1] These are some examples that happens when the output is not correctly formatted:
[1]
[1] [report.emissions.2022.scope3.categories.16_other] of type [long] in document with id '935401c8-2f8b-4549-a650-4c1565e46080'. Preview of field's value: 'more than 80% of Camurus climate impact is in scope 3'
[1] ResponseError: illegal_argument_exception: [illegal_argument_exception] Reason: mapper [report.factors.value] cannot be changed from type [long] to [float]
[1] ResponseError: mapper_parsing_exception: [mapper_parsing_exception] Reason: failed to parse field [report.emissions.2022.scope3.categories.11_useOfSoldProducts] of type [long] in document with id '254318db-872a-479d-8540-38eb146c7ba0'. Preview of field's value: '{energyInput=374759000, energyLoss=59405000}'
[1]
[1] ```json
[1] {
[1]   "type": "object",
[1]   "properties": {
[1]     "companyName": {
[1]       "type": "keyword"
[1]     },
[1]     "wikidataId": {
[1]       "type": "keyword"
[1]     },
[1]     "description": {
[1]       "type": "keyword"
[1]     },
[1]     "fiscalYear": {
[1]       "type": "object",
[1]       "properties": {
[1]         "startMonth": {
[1]           "type": "double"
[1]         },
[1]         "endMonth": {
[1]           "type": "double"
[1]         }
[1]       }
[1]     },
[1]     "industryGics": {
[1]       "type": "object",
[1]       "properties": {
[1]         "name": {
[1]           "type": "keyword"
[1]         },
[1]         "sector": {
[1]           "type": "object",
[1]           "properties": {
[1]             "code": {
[1]               "type": "keyword"
[1]             },
[1]             "name": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         },
[1]         "group": {
[1]           "type": "object",
[1]           "properties": {
[1]             "code": {
[1]               "type": "keyword"
[1]             },
[1]             "name": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         },
[1]         "industry": {
[1]           "type": "object",
[1]           "properties": {
[1]             "code": {
[1]               "type": "keyword"
[1]             },
[1]             "name": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         },
[1]         "subIndustry": {
[1]           "type": "object",
[1]           "properties": {
[1]             "code": {
[1]               "type": "keyword"
[1]             },
[1]             "name": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "industryNace": {
[1]       "type": "object",
[1]       "properties": {
[1]         "section": {
[1]           "type": "object",
[1]           "properties": {
[1]             "code": {
[1]               "type": "keyword"
[1]             },
[1]             "name": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         },
[1]         "division": {
[1]           "type": "object",
[1]           "properties": {
[1]             "code": {
[1]               "type": "keyword"
[1]             },
[1]             "name": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "baseYear": {
[1]       "type": "keyword"
[1]     },
[1]     "url": {
[1]       "type": "keyword"
[1]     },
[1]     "initiatives": {
[1]       "type": "array",
[1]       "items": {
[1]         "type": "object",
[1]         "properties": {
[1]           "description": {
[1]             "type": "text"
[1]           },
[1]           "title": {
[1]             "type": "text"
[1]           },
[1]           "scope": {
[1]             "type": "text"
[1]           },
[1]           "year": {
[1]             "type": "keyword"
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "goals": {
[1]       "type": "array",
[1]       "items": {
[1]         "type": "object",
[1]         "properties": {
[1]           "description": {
[1]             "type": "text"
[1]           },
[1]           "year": {
[1]             "type": "keyword"
[1]           },
[1]           "target": {
[1]             "type": "double"
[1]           },
[1]           "baseYear": {
[1]             "type": "keyword"
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "factors": {
[1]       "type": "array",
[1]       "items": {
[1]         "type": "object",
[1]         "properties": {
[1]           "product": {
[1]             "type": "keyword"
[1]           },
[1]           "description": {
[1]             "type": "text"
[1]           },
[1]           "value": {
[1]             "type": "double"
[1]           },
[1]           "unit": {
[1]             "type": "keyword"
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "baseFacts": {
[1]       "type": "object",
[1]       "properties": {
[1]         "*": {
[1]           "type": "object",
[1]           "properties": {
[1]             "year": {
[1]               "type": "keyword"
[1]             },
[1]             "turnover": {
[1]               "type": "double"
[1]             },
[1]             "unit": {
[1]               "type": "keyword"
[1]             },
[1]             "employees": {
[1]               "type": "double"
[1]             }
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "emissions": {
[1]       "type": "object",
[1]       "properties": {
[1]         "*": {
[1]           "type": "object",
[1]           "properties": {
[1]             "year": {
[1]               "type": "keyword"
[1]             },
[1]             "scope1": {
[1]               "properties": {
[1]                 "emissions": {
[1]                   "type": "double"
[1]                 },
[1]                 "verified": {
[1]                   "type": "string"
[1]                 },
[1]                 "biogenic": {
[1]                   "type": "double"
[1]                 },
[1]                 "unit": {
[1]                   "type": "keyword"
[1]                 }
[1]               }
[1]             },
[1]             "scope2": {
[1]               "properties": {
[1]                 "emissions": {
[1]                   "type": "double"
[1]                 },
[1]                 "verified": {
[1]                   "type": "string"
[1]                 },
[1]                 "biogenic": {
[1]                   "type": "double"
[1]                 },
[1]                 "unit": {
[1]                   "type": "keyword"
[1]                 },
[1]                 "mb": {
[1]                   "type": "double"
[1]                 },
[1]                 "lb": {
[1]                   "type": "double"
[1]                 }
[1]               }
[1]             },
[1]             "scope3": {
[1]               "properties": {
[1]                 "emissions": {
[1]                   "type": "double"
[1]                 },
[1]                 "verified": {
[1]                   "type": "string"
[1]                 },
[1]                 "biogenic": {
[1]                   "type": "double"
[1]                 },
[1]                 "unit": {
[1]                   "type": "keyword"
[1]                 },
[1]                 "baseYear": {
[1]                   "type": "keyword"
[1]                 },
[1]                 "categories": {
[1]                   "properties": {
[1]                     "1_purchasedGoods": {
[1]                       "type": "double"
[1]                     },
[1]                     "2_capitalGoods": {
[1]                       "type": "double"
[1]                     },
[1]                     "3_fuelAndEnergyRelatedActivities": {
[1]                       "type": "double"
[1]                     },
[1]                     "4_upstreamTransportationAndDistribution": {
[1]                       "type": "double"
[1]                     },
[1]                     "5_wasteGeneratedInOperations": {
[1]                       "type": "double"
[1]                     },
[1]                     "6_businessTravel": {
[1]                       "type": "double"
[1]                     },
[1]                     "7_employeeCommuting": {
[1]                       "type": "double"
[1]                     },
[1]                     "8_upstreamLeasedAssets": {
[1]                       "type": "double"
[1]                     },
[1]                     "9_downstreamTransportationAndDistribution": {
[1]                       "type": "double"
[1]                     },
[1]                     "10_processingOfSoldProducts": {
[1]                       "type": "double"
[1]                     },
[1]                     "11_useOfSoldProducts": {
[1]                       "type": "double"
[1]                     },
[1]                     "12_endOfLifeTreatmentOfSoldProducts": {
[1]                       "type": "double"
[1]                     },
[1]                     "13_downstreamLeasedAssets": {
[1]                       "type": "double"
[1]                     },
[1]                     "14_franchises": {
[1]                       "type": "double"
[1]                     },
[1]                     "15_investments": {
[1]                       "type": "double"
[1]                     },
[1]                     "16_other": {
[1]                       "type": "double"
[1]                     }
[1]                   }
[1]                 }
[1]               }
[1]             },
[1]             "totalEmissions": {
[1]               "type": "double"
[1]             },
[1]             "totalUnit": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "contacts": {
[1]       "type": "object",
[1]       "properties": {
[1]         "*": {
[1]           "type": "object",
[1]           "properties": {
[1]             "name": {
[1]               "type": "text"
[1]             },
[1]             "role": {
[1]               "type": "text"
[1]             },
[1]             "email": {
[1]               "type": "keyword"
[1]             },
[1]             "phone": {
[1]               "type": "keyword"
[1]             }
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "wikidata": {
[1]       "type": "object",
[1]       "properties": {
[1]         "node": {
[1]           "type": "keyword"
[1]         },
[1]         "url": {
[1]           "type": "keyword"
[1]         },
[1]         "logo": {
[1]           "type": "keyword"
[1]         },
[1]         "label": {
[1]           "type": "keyword"
[1]         },
[1]         "description": {
[1]           "type": "keyword"
[1]         },
[1]         "emissions": {
[1]           "type": "array",
[1]           "items": {
[1]             "type": "object",
[1]             "properties": {
[1]               "year": {
[1]                 "type": "keyword"
[1]               },
[1]               "reference": {
[1]                 "type": "keyword"
[1]               },
[1]               "scope1": {
[1]                 "type": "object",
[1]                 "properties": {
[1]                   "emissions": {
[1]                     "type": "double"
[1]                   },
[1]                   "biogenic": {
[1]                     "type": "double"
[1]                   },
[1]                   "unit": {
[1]                     "type": "keyword"
[1]                   },
[1]                   "verified": {
[1]                     "type": "keyword"
[1]                   }
[1]                 }
[1]               },
[1]               "scope2": {
[1]                 "type": "object",
[1]                 "properties": {
[1]                   "emissions": {
[1]                     "type": "double"
[1]                   },
[1]                   "biogenic": {
[1]                     "type": "double"
[1]                   },
[1]                   "unit": {
[1]                     "type": "keyword"
[1]                   },
[1]                   "mb": {
[1]                     "type": "double"
[1]                   },
[1]                   "lb": {
[1]                     "type": "double"
[1]                   },
[1]                   "verified": {
[1]                     "type": "keyword"
[1]                   }
[1]                 }
[1]               },
[1]               "scope3": {
[1]                 "type": "object",
[1]                 "properties": {
[1]                   "emissions": {
[1]                     "type": "double"
[1]                   },
[1]                   "unit": {
[1]                     "type": "keyword"
[1]                   },
[1]                   "baseYear": {
[1]                     "type": "keyword"
[1]                   },
[1]                   "verified": {
[1]                     "type": "keyword"
[1]                   },
[1]                   "categories": {
[1]                     "type": "object",
[1]                     "properties": {
[1]                       "1_purchasedGoods": {
[1]                         "type": "double"
[1]                       },
[1]                       "2_capitalGoods": {
[1]                         "type": "double"
[1]                       },
[1]                       "3_fuelAndEnergyRelatedActivities": {
[1]                         "type": "double"
[1]                       },
[1]                       "4_upstreamTransportationAndDistribution": {
[1]                         "type": "double"
[1]                       },
[1]                       "5_wasteGeneratedInOperations": {
[1]                         "type": "double"
[1]                       },
[1]                       "6_businessTravel": {
[1]                         "type": "double"
[1]                       },
[1]                       "7_employeeCommuting": {
[1]                         "type": "double"
[1]                       },
[1]                       "8_upstreamLeasedAssets": {
[1]                         "type": "double"
[1]                       },
[1]                       "9_downstreamTransportationAndDistribution": {
[1]                         "type": "double"
[1]                       },
[1]                       "10_processingOfSoldProducts": {
[1]                         "type": "double"
[1]                       },
[1]                       "11_useOfSoldProducts": {
[1]                         "type": "double"
[1]                       },
[1]                       "12_endOfLifeTreatmentOfSoldProducts": {
[1]                         "type": "double"
[1]                       },
[1]                       "13_downstreamLeasedAssets": {
[1]                         "type": "double"
[1]                       },
[1]                       "14_franchises": {
[1]                         "type": "double"
[1]                       },
[1]                       "15_investments": {
[1]                         "type": "double"
[1]                       },
[1]                       "16_other": {
[1]                         "type": "double"
[1]                       }
[1]                     }
[1]                   }
[1]                 }
[1]               }
[1]             }
[1]           }
[1]         }
[1]       }
[1]     },
[1]     "facit": {
[1]       "type": "object"
[1]     },
[1]     "publicComment": {
[1]       "type": "text"
[1]     },
[1]     "reliability": {
[1]       "type": "keyword"
[1]     },
[1]     "needsReview": {
[1]       "type": "boolean"
[1]     },
[1]     "reviewComment": {
[1]       "type": "text"
[1]     }
[1]   }
[1] }
[1] ```
[1]
[1]
[1] Reply with JSON without any comments, excuses or markdown formatting. Wrap your message with:
[1] ```json
[1] ```
[1]
[1] PreviousJson
[1] {
[1]   "companyName": "Better Collective",
[1]   "description": "Better Collective är en ledande digital sportmediegrupp som utvecklar utbildningsplattformar inom iGaming-industrin.",
[1]   "wikidataId": "Q111843935",
[1]   "industryGics": null,
[1]   "industryNace": null,
[1]   "baseYear": "2019",
[1]   "url": "https://storage.mfn.se/28882872-33ec-4750-9726-fc91ed1fad94/sustainability-report-2023.pdf",
[1]   "emissions": {
[1]     "2023": {
[1]       "year": "2023",
[1]       "scope1": {
[1]         "emissions": 71,
[1]         "biogenic": null,
[1]         "verified": "https://www.wikidata.org/wiki/Q124883250",
[1]         "unit": "tCO2e"
[1]       },
[1]       "scope2": {
[1]         "emissions": 247,
[1]         "biogenic": null,
[1]         "verified": "https://www.wikidata.org/wiki/Q124883330",
[1]         "unit": "tCO2e",
[1]         "mb": 247,
[1]         "lb": null
[1]       },
[1]       "scope3": {
[1]         "emissions": 2596.1,
[1]         "verified": "https://www.wikidata.org/wiki/Q124883309",
[1]         "biogenic": null,
[1]         "unit": "tCO2e",
[1]         "categories": {
[1]           "1_purchasedGoods": 8.3,
[1]           "2_capitalGoods": null,
[1]           "3_fuelAndEnergyRelatedActivities": null,
[1]           "4_upstreamTransportationAndDistribution": null,
[1]           "5_wasteGeneratedInOperations": null,
[1]           "6_businessTravel": null,
[1]           "7_employeeCommuting": null,
[1]           "8_upstreamLeasedAssets": null,
[1]           "9_downstreamTransportationAndDistribution": null,
[1]           "10_processingOfSoldProducts": null,
[1]           "11_useOfSoldProducts": null,
[1]           "12_endOfLifeTreatmentOfSoldProducts": null,
[1]           "13_downstreamLeasedAssets": null,
[1]           "14_franchises": null,
[1]           "15_investments": null,
[1]           "16_other": null
[1]         }
[1]       }
[1]     }
[1]   },
[1]   "baseFacts": null,
[1]   "factors": null,
[1]   "contacts": null,
[1]   "goals": null,
[1]   "initiatives": null,
[1]   "wikidata": {
[1]     "node": "Q111843935",
[1]     "url": "https://www.wikidata.org/wiki/Q111843935",
[1]     "logo": "https://commons.wikimedia.org/wiki/File:Example.jpg",
[1]     "label": "Better Collective",
[1]     "description": "Better Collective är en ledande digital sportmediegrupp som utvecklar utbildningsplattformar inom iGaming-industrin.",
[1]     "emissions": [
[1]       {
[1]         "year": "2023",
[1]         "reference": "https://storage.mfn.se/28882872-33ec-4750-9726-fc91ed1fad94/sustainability-report-2023.pdf",
[1]         "scope1": {
[1]           "emissions": 71,
[1]           "biogenic": null,
[1]           "unit": "tCO2e"
[1]         },
[1]         "scope2": {
[1]           "emissions": 247,
[1]           "biogenic": null,
[1]           "unit": "tCO2e",
[1]           "mb": null,
[1]           "lb": null
[1]         },
[1]         "scope3": {
[1]           "emissions": 2596,
[1]           "unit": "tCO2e",
[1]           "categories": {
[1]             "1_purchasedGoods": 8.3,
[1]             "2_capitalGoods": null,
[1]             "3_fuelAndEnergyRelatedActivities": null,
[1]             "4_upstreamTransportationAndDistribution": null,
[1]             "5_wasteGeneratedInOperations": null,
[1]             "6_businessTravel": null,
[1]             "7_employeeCommuting": null,
[1]             "8_upstreamLeasedAssets": null,
[1]             "9_downstreamTransportationAndDistribution": null,
[1]             "10_processingOfSoldProducts": null,
[1]             "11_useOfSoldProducts": null,
[1]             "12_endOfLifeTreatmentOfSoldProducts": null,
[1]             "13_downstreamLeasedAssets": null,
[1]             "14_franchises": null,
[1]             "15_investments": null,
[1]             "16_other": null
[1]           }
[1]         }
[1]       }
[1]     ]
[1]   },
[1]   "facit": {
[1]     "2023": {
[1]       "scope1": {
[1]         "emissions": 71,
[1]         "biogenic": null
[1]       },
[1]       "scope2": {
[1]         "emissions": 247,
[1]         "biogenic": null,
[1]         "mb": 247,
[1]         "lb": null
[1]       },
[1]       "scope3": {
[1]         "emissions": 2596.1,
[1]         "categories": {
[1]           "1_purchasedGoods": 8.3,
[1]           "2_capitalGoods": null,
[1]           "3_fuelAndEnergyRelatedActivities": null,
[1]           "4_upstreamTransportationAndDistribution": null,
[1]           "5_wasteGeneratedInOperations": null,
[1]           "6_businessTravel": null,
[1]           "7_employeeCommuting": null,
[1]           "8_upstreamLeasedAssets": null,
[1]           "9_downstreamTransportationAndDistribution": null,
[1]           "10_processingOfSoldProducts": null,
[1]           "11_useOfSoldProducts": null,
[1]           "12_endOfLifeTreatmentOfSoldProducts": null,
[1]           "13_downstreamLeasedAssets": null,
[1]           "14_franchises": null,
[1]           "15_investments": null,
[1]           "16_other": null
[1]         }
[1]       }
[1]     },
[1]     "wikidataId": "Q111843935",
[1]     "companyName": "Better Collective"
[1]   },
[1]   "reliability": "High",
[1]   "needsReview": false,
[1]   "reviewComment": "Alla data har verifierats med Wikidata och facit-objektet."
[1] }
[1] PreviousAnswer
[1] undefined
[1] PreviousError
[1] undefined
[1] Response
[1] {
[1]   "companyName": "Better Collective",
[1]   "description": "Better Collective är en ledande digital sportmediegrupp som utvecklar utbildningsplattformar inom iGaming-industrin.",
[1]   "wikidataId": "Q111843935",
[1]   "industryGics": null,
[1]   "industryNace": null,
[1]   "baseYear": "2019",
[1]   "url": "https://storage.mfn.se/28882872-33ec-4750-9726-fc91ed1fad94/sustainability-report-2023.pdf",
[1]   "emissions": {
[1]     "2023": {
[1]       "year": "2023",
[1]       "scope1": {
[1]         "emissions": 71,
[1]         "biogenic": null,
[1]         "verified": "https://www.wikidata.org/wiki/Q124883250",
[1]         "unit": "tCO2e"
[1]       },
[1]       "scope2": {
[1]         "emissions": 247,
[1]         "biogenic": null,
[1]         "verified": "https://www.wikidata.org/wiki/Q124883330",
[1]         "unit": "tCO2e",
[1]         "mb": 247,
[1]         "lb": null
[1]       },
[1]       "scope3": {
[1]         "emissions": 2596.1,
[1]         "verified": "https://www.wikidata.org/wiki/Q124883309",
[1]         "biogenic": null,
[1]         "unit": "tCO2e",
[1]         "categories": {
[1]           "1_purchasedGoods": 8.3
[1]         }
[1]       }
[1]     }
[1]   },
[1]   "baseFacts": null,
[1]   "factors": null,
[1]   "contacts": null,
[1]   "goals": null,
[1]   "initiatives": null,
[1]   "wikidata": {
[1]     "node": "Q111843935",
[1]     "url": "https://www.wikidata.org/wiki/Q111843935",
[1]     "logo": "https://commons.wikimedia.org/wiki/File:Example.jpg",
[1]     "label": "Better Collective",
[1]     "description": "Better Collective är en ledande digital sportmediegrupp som utvecklar utbildningsplattformar inom iGaming-industrin.",
[1]     "emissions": [
[1]       {
[1]         "year": "2023",
[1]         "reference": "https://storage.mfn.se/28882872-33ec-4750-9726-fc91ed1fad94/sustainability-report-2023.pdf",
[1]         "scope1": {
[1]           "emissions": 71,
[1]           "biogenic": null,
[1]           "unit": "tCO2e",
[1]           "verified": null
[1]         },
[1]         "scope2": {
[1]           "emissions": 247,
[1]           "biogenic": null,
[1]           "unit": "tCO2e",
[1]           "mb": null,
[1]           "lb": null,
[1]           "verified": null
[1]         },
[1]         "scope3": {
[1]           "emissions": 2596,
[1]           "unit": "tCO2e",
[1]           "categories": {
[1]             "1_purchasedGoods": 8.3
[1]           },
[1]           "verified": null
[1]         }
[1]       }
[1]     ]
[1]   },
[1]   "facit": {
[1]     "2023": {
[1]       "scope1": {
[1]         "emissions": 71,
[1]         "biogenic": null
[1]       },
[1]       "scope2": {
[1]         "emissions": 247,
[1]         "biogenic": null,
[1]         "mb": 247,
[1]         "lb": null
[1]       },
[1]       "scope3": {
[1]         "emissions": 2596.1,
[1]         "categories": {
[1]           "1_purchasedGoods": 8.3
[1]         }
[1]       }
[1]     },
[1]     "wikidataId": "Q111843935",
[1]     "companyName": "Better Collective"
[1]   },
[1]   "reliability": "High",
[1]   "needsReview": false,
[1]   "reviewComment": "Alla data har verifierats med Wikidata och facit-objektet."
[1] }