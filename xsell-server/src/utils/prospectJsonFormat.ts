export const prospectFormat = {
    "prospect": {
      "companyInfo": {
        "name": "string",
        "industry": "string",
        "size": {
          "employees": "number",
          "annualRevenue": "string"
        },
        "location": {
          "headquarters": "string",
          "operationalRegions": ["string"]
        },
        "foundedYear": "number"
      },
      "businessProfile": {
        "productOrService": "string",
        "targetMarket": "string",
        "uniqueSellingProposition": "string",
        "growthStage": "string",
        "technologyAdoption": 0-10
      },
      "decisionMakers": [
        {
          "role": "string",
          "painPoints": ["string"],
          "interests": ["string"],
          "communicationPreference": "string"
        }
      ],
      "financialHealth": {
        "profitability": 0-10,
        "cashFlow": 0-10,
        "debtLevel": 0-10,
        "investmentCapacity": 0-10
      },
      "marketPosition": {
        "competitiveAdvantage": "string",
        "marketShare": 0-10,
        "brandAwareness": 0-10,
        "customerLoyalty": 0-10
      },
      "challenges": [
        {
          "description": "string",
          "severity": 0-10,
          "potentialSolution": "string"
        }
      ],
      "opportunities": [
        {
          "description": "string",
          "potentialImpact": 0-10,
          "alignmentWithOurOffering": 0-10
        }
      ],
      "buyingReadiness": {
        "awarenessTrigger": "string",
        "stage": "string",
        "timelineToDecision": "string",
        "budgetAllocation": 0-10
      },
      "relationshipHistory": {
        "pastInteractions": ["string"],
        "currentRelationshipStrength": 0-10,
        "notesOnPreference": "string"
      }
    }
  };