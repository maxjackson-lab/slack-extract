# Complete Gamma API Documentation

## Overview

The Gamma Generate API allows developers to programmatically create presentations, documents, and social media posts using Gamma's AI-powered design platform. This API is currently in beta and provides comprehensive content generation capabilities.

## API Information

- **Base URL**: `https://public-api.gamma.app`
- **Current Version**: v0.2
- **Status**: Beta (functionality, rate limits, and pricing subject to change)
- **Authentication**: API Key (format: `sk-gamma-xxxxxxxx`)

## Authentication

### API Key Authentication
All API requests require authentication using an API key in the request header.

**Header**: `X-API-KEY: sk-gamma-xxxxxxxx`

### Getting API Access
- **Eligibility**: Pro, Ultra, Teams, and Business plan subscribers
- **API Key Generation**: Available through account settings in Gamma dashboard
- **Key Format**: `sk-gamma-xxxxxxxx`

## Rate Limits and Usage

### Current Beta Limits
- **Rate Limit**: 50 generations per day per user
- **Authentication**: API key only (OAuth not yet supported)
- **Pricing**: Credit-based system included with subscription during beta

### Credit System
Credits are charged based on:

| Feature | API Parameter | Credits Charged |
|---------|---------------|-----------------|
| Number of cards | `numCards` | ~3 credits/card |
| AI Images (Basic) | `imageOptions.model` | ~2 credits/image |
| AI Images (Advanced) | `imageOptions.model` | ~10-20 credits/image |
| AI Images (Premium) | `imageOptions.model` | ~20-40 credits/image |
| AI Images (Ultra) | `imageOptions.model` | ~40-120 credits/image |

## Endpoints

### POST /v0.2/generations
**Description**: Create a gamma (presentation, document, or social content)  
**URL**: `https://public-api.gamma.app/v0.2/generations`  
**Method**: POST  
**Content-Type**: `application/json`

#### Request Parameters

##### Required Parameters
- **`inputText`** (string, required): Text used to generate gamma
  - Character limits: 1-750,000
  - Can be brief topic description or detailed content
  - Supports card splitting with `\n---\n`
  - Example: `"Pitch deck on deep sea exploration"`

##### Top-Level Optional Parameters
- **`textMode`** (string, default: `"generate"`): How to modify input text
  - Options: `"generate"`, `"condense"`, `"preserve"`
  - `generate`: Expand and rewrite content
  - `condense`: Summarize content
  - `preserve`: Keep original text structure

- **`format`** (string, default: `"presentation"`): Type of content to create
  - Options: `"presentation"`, `"document"`, `"social"`

- **`themeName`** (string, optional): Gamma theme for styling
  - Uses workspace default if not specified
  - Supports custom themes
  - Example: `"Night Sky"`

- **`numCards`** (integer, default: 10): Number of cards when using auto split
  - Pro users: 1-60
  - Ultra users: 1-75

- **`cardSplit`** (string, default: `"auto"`): Content division method
  - Options: `"auto"`, `"inputTextBreaks"`
  - `auto`: Uses `numCards` to divide content
  - `inputTextBreaks`: Uses `\n---\n` markers in input

- **`additionalInstructions`** (string, optional): Extra content specifications
  - Character limits: 1-500
  - Example: `"Make the titles catchy"`

- **`exportAs`** (string, optional): Additional export formats
  - Options: `"pdf"`, `"pptx"`
  - Files become invalid after period of time

##### textOptions Object
- **`amount`** (string, default: `"medium"`): Text amount per card
  - Options: `"brief"`, `"medium"`, `"detailed"`, `"extensive"`
  - Only relevant when textMode is `"generate"` or `"condense"`

- **`tone`** (string, optional): Mood/voice of content
  - Character limits: 1-500
  - Only relevant when textMode is `"generate"`
  - Example: `"professional, upbeat, inspiring"`

- **`audience`** (string, optional): Target audience description
  - Character limits: 1-500
  - Only relevant when textMode is `"generate"`
  - Example: `"outdoors enthusiasts, adventure seekers"`

- **`language`** (string, default: `"en"`): Output language
  - 60+ supported languages
  - Examples: `"en"`, `"es"`, `"fr"`, `"de"`, `"zh-cn"`

##### imageOptions Object
- **`source`** (string, default: `"aiGenerated"`): Image source type
  - Options: `"aiGenerated"`, `"pictographic"`, `"unsplash"`, `"webAllImages"`, `"webFreeToUse"`, `"webFreeToUseCommercially"`, `"giphy"`, `"placeholder"`, `"noImages"`

- **`model`** (string, optional): AI image generation model
  - Only applicable when source is `"aiGenerated"`
  - Available models with credit costs:
    - `"flux-1-quick"` (2 credits)
    - `"imagen-3-flash"` (2 credits) 
    - `"flux-1-pro"` (8 credits)
    - `"imagen-3-pro"` (8 credits)
    - `"ideogram-v3-turbo"` (10 credits)
    - `"leonardo-phoenix"` (15 credits)
    - `"recraft-v3"` (20 credits)
    - `"dall-e-3"` (33 credits)
    - `"flux-1-ultra"` (30 credits, Ultra plan only)

- **`style`** (string, optional): AI image artistic style
  - Character limits: 1-500
  - Only applicable when source is `"aiGenerated"`
  - Example: `"minimal, black and white, line art"`

##### cardOptions Object
- **`dimensions`** (string, optional): Card aspect ratio
  - Presentation format: `"fluid"` (default), `"16x9"`, `"4x3"`
  - Document format: `"fluid"` (default), `"pageless"`, `"letter"`, `"a4"`
  - Social format: `"1x1"`, `"4x5"` (default), `"9x16"`

##### sharingOptions Object
- **`workspaceAccess`** (string, optional): Workspace member access level
  - Options: `"noAccess"`, `"view"`, `"comment"`, `"edit"`, `"fullAccess"`
  - Defaults to workspace settings

- **`externalAccess`** (string, optional): External user access level
  - Options: `"noAccess"`, `"view"`, `"comment"`, `"edit"`
  - Defaults to workspace settings

#### Example Request
```json
{
  "inputText": "Best hikes in the United States",
  "textMode": "generate",
  "format": "presentation",
  "themeName": "Oasis",
  "numCards": 10,
  "cardSplit": "auto",
  "additionalInstructions": "Make the titles catchy",
  "exportAs": "pdf",
  "textOptions": {
    "amount": "detailed",
    "tone": "professional, inspiring",
    "audience": "outdoors enthusiasts, adventure seekers",
    "language": "en"
  },
  "imageOptions": {
    "source": "aiGenerated",
    "model": "imagen-4-pro",
    "style": "photorealistic"
  },
  "cardOptions": {
    "dimensions": "fluid"
  },
  "sharingOptions": {
    "workspaceAccess": "view",
    "externalAccess": "noAccess"
  }
}
```

#### Response
```json
{
  "generationId": "xxxxxxxxxxx"
}
```

### GET /v0.2/generations/{generationId}
**Description**: Retrieve generation status and URLs  
**URL**: `https://public-api.gamma.app/v0.2/generations/{generationId}`  
**Method**: GET

#### Path Parameters
- **`generationId`** (string, required): ID returned from POST request

#### Headers
- **`X-API-KEY`** (string, required): Your API key

#### Response Examples

**In Progress**:
```json
{
  "generationId": "XXXXXXXXXXX",
  "status": "processing",
  "credits": {
    "deducted": 0,
    "remaining": 3000
  }
}
```

**Completed**:
```json
{
  "generationId": "XXXXXXXXXXX",
  "status": "completed",
  "gammaUrl": "https://gamma.app/docs/yyyyyyyyyy",
  "pdfUrl": "https://export.gamma.app/pdf/...",
  "pptxUrl": "https://export.gamma.app/pptx/...",
  "credits": {
    "deducted": 150,
    "remaining": 2850
  }
}
```

**Failed**:
```json
{
  "generationId": "XXXXXXXXXXX",
  "status": "failed",
  "error": "Failed to generate content",
  "credits": {
    "deducted": 0,
    "remaining": 3000
  }
}
```

## Supported Languages

The API supports 60+ languages for content generation:

| Language | Code | Language | Code |
|----------|------|----------|------|
| English (US) | `en` | Spanish | `es` |
| English (UK) | `en-gb` | Spanish (Mexico) | `es-mx` |
| English (India) | `en-in` | Spanish (Spain) | `es-es` |
| French | `fr` | Portuguese (Brazil) | `pt-br` |
| German | `de` | Portuguese (Portugal) | `pt-pt` |
| Italian | `it` | Russian | `ru` |
| Chinese (Simplified) | `zh-cn` | Chinese (Traditional) | `zh-tw` |
| Japanese | `ja` | Korean | `ko` |
| Arabic | `ar` | Hindi | `hi` |
| Dutch | `nl` | Swedish | `sv` |
| Norwegian | `nb` | Danish | `da` |
| Finnish | `fi` | Polish | `pl` |
| Czech | `cs` | Hungarian | `hu` |
| Romanian | `ro` | Bulgarian | `bg` |
| Croatian | `hr` | Serbian | `sr` |
| Ukrainian | `uk` | Turkish | `tr` |
| Hebrew | `he` | Thai | `th` |
| Vietnamese | `vi` | Indonesian | `id` |
| Malay | `ms` | Tagalog | `tl` |
| Gujarati | `gu` | Bengali | `bn` |
| Tamil | `ta` | Telugu | `te` |
| Kannada | `kn` | Malayalam | `ml` |
| Marathi | `mr` | Urdu | `ur` |
| Persian | `fa` | Kazakh | `kk` |
| Uzbek | `uz` | Estonian | `et` |
| Latvian | `lv` | Lithuanian | `lt` |
| Slovenian | `sl` | Macedonian | `mk` |
| Albanian | `sq` | Bosnian | `bs` |
| Icelandic | `is` | Welsh | `cy` |
| Catalan | `ca` | Greek | `el` |
| Afrikaans | `af` | Hausa | `ha` |
| Swahili | `sw` | Yoruba | `yo` |

## Image Models

Complete list of available AI image generation models:

| Model Name | API String | Credits/Image | Plan Requirement |
|------------|------------|---------------|------------------|
| Flux Fast 1.1 | `flux-1-quick` | 2 | Pro+ |
| Flux Kontext Fast | `flux-kontext-fast` | 2 | Pro+ |
| Imagen 3 Fast | `imagen-3-flash` | 2 | Pro+ |
| Luma Photon Flash | `luma-photon-flash-1` | 2 | Pro+ |
| Flux Pro | `flux-1-pro` | 8 | Pro+ |
| Imagen 3 | `imagen-3-pro` | 8 | Pro+ |
| Ideogram 3 Turbo | `ideogram-v3-turbo` | 10 | Pro+ |
| Luma Photon | `luma-photon-1` | 10 | Pro+ |
| Leonardo Phoenix | `leonardo-phoenix` | 15 | Pro+ |
| Flux Kontext Pro | `flux-kontext-pro` | 20 | Pro+ |
| Ideogram 3 | `ideogram-v3` | 20 | Pro+ |
| Imagen 4 | `imagen-4-pro` | 20 | Pro+ |
| Recraft | `recraft-v3` | 20 | Pro+ |
| GPT Image | `gpt-image-1-medium` | 30 | Pro+ |
| Flux Ultra | `flux-1-ultra` | 30 | Ultra only |
| Imagen 4 Ultra | `imagen-4-ultra` | 30 | Ultra only |
| Dall E 3 | `dall-e-3` | 33 | Pro+ |
| Flux Kontext Max | `flux-kontext-max` | 40 | Ultra only |
| Recraft Vector | `recraft-v3-svg` | 40 | Pro+ |
| Ideogram 3.0 Quality | `ideogram-v3-quality` | 45 | Ultra only |
| GPT Image Detailed | `gpt-image-1-high` | 120 | Ultra only |

## Error Codes

### HTTP Status Codes

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Input validation errors | Invalid parameters detected |
| 401 | Invalid API key | API key invalid or not Pro account |
| 403 | Forbidden | No credits remaining |
| 404 | Generation ID not found | Invalid generation ID |
| 422 | Failed to generate text | Empty output, review inputs |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Generation error | Server error, contact support |
| 502 | Bad gateway | Temporary gateway issue |

### Error Response Format
```json
{
  "message": "Invalid API key.",
  "statusCode": 401
}
```

### Warnings
The API may return warnings for conflicting parameters:

**Conflicting format and dimensions**:
```json
{
  "generationId": "xxxxxxxxxx",
  "warnings": "cardOptions.dimensions 1x1 is not valid for format presentation. Valid dimensions are: [ 16x9, 4x3, fluid ]. Using default: fluid."
}
```

**Conflicting image source and model**:
```json
{
  "generationId": "xxxxxxxxxx", 
  "warnings": "imageOptions.model and imageOptions.style are ignored when imageOptions.source is not aiGenerated."
}
```

## Usage Examples

### Basic Presentation Generation
```bash
curl --request POST \
  --url https://public-api.gamma.app/v0.2/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: sk-gamma-xxxxxxxx' \
  --data '{
    "inputText": "Company quarterly review",
    "format": "presentation",
    "numCards": 8
  }'
```

### Document with Custom Theme
```bash
curl --request POST \
  --url https://public-api.gamma.app/v0.2/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: sk-gamma-xxxxxxxx' \
  --data '{
    "inputText": "Product requirements document for mobile app",
    "format": "document",
    "themeName": "Professional",
    "textOptions": {
      "amount": "detailed",
      "tone": "technical, precise"
    }
  }'
```

### Social Media Post with AI Images
```bash
curl --request POST \
  --url https://public-api.gamma.app/v0.2/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: sk-gamma-xxxxxxxx' \
  --data '{
    "inputText": "5 tips for remote work productivity",
    "format": "social",
    "cardOptions": {
      "dimensions": "1x1"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "flux-1-pro",
      "style": "clean, minimal, professional"
    }
  }'
```

### Checking Generation Status
```bash
curl --request GET \
  --url https://public-api.gamma.app/v0.2/generations/your_generation_id \
  --header 'X-API-KEY: sk-gamma-xxxxxxxx' \
  --header 'accept: application/json'
```

## Best Practices

### Content Guidelines
- Provide actual content in `inputText`, not instructions
- Use clear, descriptive text for better results
- Leverage `additionalInstructions` for specific requirements
- Themes must be pre-created in Gamma before referencing

### Polling Recommendations
- Poll generation status every ~5 seconds
- API-generated gammas appear in dashboard with API tag
- Download export files immediately as links expire

### Error Handling
- Always check for warnings in responses
- Include `x-request-id` header when requesting support
- Validate parameters before submission to avoid 400 errors

### Performance Optimization
- Use appropriate image models based on quality needs
- Consider credit costs when selecting premium models
- Batch related generations when possible

## Integration Examples

### Automation Platform Integration
The API works with popular automation platforms:
- **Zapier**: Native Gamma integration available
- **Make.com**: HTTP module with API endpoints
- **Workato**: Custom connector capability
- **N8N**: HTTP request nodes

### Backend Integration Sample (Python)
```python
import requests
import time

def create_gamma(api_key, content):
    headers = {
        'Content-Type': 'application/json',
        'X-API-KEY': api_key
    }
    
    payload = {
        'inputText': content,
        'format': 'presentation',
        'textOptions': {
            'amount': 'medium',
            'tone': 'professional'
        }
    }
    
    # Create generation
    response = requests.post(
        'https://public-api.gamma.app/v0.2/generations',
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        raise Exception(f"Generation failed: {response.text}")
    
    generation_id = response.json()['generationId']
    
    # Poll for completion
    while True:
        status_response = requests.get(
            f'https://public-api.gamma.app/v0.2/generations/{generation_id}',
            headers={'X-API-KEY': api_key}
        )
        
        status_data = status_response.json()
        
        if status_data['status'] == 'completed':
            return status_data['gammaUrl']
        elif status_data['status'] == 'failed':
            raise Exception("Generation failed")
        
        time.sleep(5)

# Usage
api_key = "sk-gamma-xxxxxxxx"
gamma_url = create_gamma(api_key, "Marketing strategy presentation")
print(f"Generated gamma: {gamma_url}")
```

## Support and Help

### Getting Help
- **API Slack Channel**: Join Gamma API Slack for quick questions and debugging
- **Support Team**: Contact support for complex issues
- **Feedback Form**: Provide broader API feedback
- **Documentation**: Always include `x-request-id` when requesting debugging help

### Debugging Information
- All API responses include `x-request-id` header
- Include this ID when contacting support
- Check warnings array for parameter conflicts
- Validate API key format and permissions

## Changelog

### September 15, 2025
- Increased usage caps to 50 generations/day/user
- Added Ultra pricing tier with advanced models
- Introduced credit-based pricing system
- Ultra users can generate up to 75-card gammas
- Launched Zapier integration

### July 28, 2025
- Initial beta release of Generate API
- POST and GET endpoints launched
- Core generation functionality available
- Basic rate limiting implemented

This completes the comprehensive Gamma API documentation covering all endpoints, parameters, authentication, error handling, and integration examples.