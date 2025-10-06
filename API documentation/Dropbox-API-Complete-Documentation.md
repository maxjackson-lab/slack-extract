# Complete Dropbox API Documentation

## Overview

The Dropbox API v2 is a comprehensive set of HTTP endpoints that enable developers to integrate with Dropbox functionality. This document contains the complete technical reference for all Dropbox API endpoints, authentication methods, and features.

## Request and Response Formats

### General Format
- **Method**: HTTP POST requests with JSON arguments and JSON responses
- **Authentication**: OAuth 2.0 using `Authorization` request header or `authorization` URL parameter
- **Content-Type**: `application/json` for RPC endpoints
- **Base URLs**:
  - RPC endpoints: `https://api.dropboxapi.com`
  - Content-upload endpoints: `https://content.dropboxapi.com`
  - Content-download endpoints: `https://content.dropboxapi.com`

### Endpoint Types

#### RPC Endpoints
- Accept arguments as JSON in request body
- Return results as JSON in response body
- Domain: `api.dropboxapi.com`

#### Content-Upload Endpoints
- Accept file content in request body
- Arguments passed as JSON in `Dropbox-API-Arg` request header
- Domain: `content.dropboxapi.com`

#### Content-Download Endpoints
- Arguments in `Dropbox-API-Arg` request header
- Response body contains file content
- Result appears as JSON in `Dropbox-API-Result` response header
- Support HTTP GET with ETag-based caching and HTTP range requests
- Domain: `content.dropboxapi.com`

### Path Formats
- Paths relative to application's root (app folder or user's Dropbox root)
- Empty string `""` represents root folder
- All other paths must start with slash (e.g., `"/hello/world.txt"`)
- Paths cannot end with slash or whitespace
- File/folder IDs: `"id:abc123xyz"` format (case-sensitive)
- Namespace-relative paths: `"ns:123456/cupcake.png"`

### Date Format
All dates use UTC in ISO 8601 format: `2015-05-15T15:50:38Z`

## Authentication

### OAuth 2.0 Authorization

#### /oauth2/authorize
**URL**: `https://www.dropbox.com/oauth2/authorize`  
**Method**: GET  
**Description**: Start OAuth 2.0 authorization flow

**Parameters**:
- `response_type` (required): `token` or `code`
- `client_id` (required): App's key from App Console
- `redirect_uri` (optional): Redirect URI after authorization
- `scope` (optional): Space-separated scopes subset
- `include_granted_scopes` (optional): `user` or `team`
- `token_access_type` (optional): `offline` or `online` (default)
- `state` (optional): CSRF protection data (max 2000 bytes)
- `code_challenge` (optional): PKCE challenge (43-128 chars)
- `code_challenge_method` (optional): `S256` or `plain`
- `require_role` (optional): `work` or `personal`
- `force_reapprove` (optional): Boolean
- `disable_signup` (optional): Boolean
- `locale` (optional): IETF language tag
- `force_reauthentication` (optional): Boolean
- `prompt` (optional): `none`, `login`, or `consent`
- `max_age` (optional): Session refresh time in seconds

**Returns**:
- **Code/PKCE flow**: `code`, `state` in query string
- **Token flow**: `access_token`, `token_type`, `account_id`, `team_id`, `uid`, `state` in URL fragment

#### /oauth2/token
**URL**: `https://api.dropboxapi.com/oauth2/token`  
**Method**: POST  
**Description**: Exchange authorization code or refresh token for access tokens

**Parameters**:
- `code` (required for auth code): Authorization code
- `grant_type` (required): `authorization_code`, `refresh_token`, or `client_credentials`
- `refresh_token` (optional): For refresh token flow
- `client_id` (optional): App key if using POST parameters
- `client_secret` (optional): App secret if using POST parameters
- `redirect_uri` (optional): Must match authorization redirect URI
- `code_verifier` (optional): PKCE verifier (43-128 chars)
- `scope` (optional): Subset of original scopes for refresh token
- `refresh_token_expiration_seconds` (optional): Refresh token validity period

**Returns**:
- `access_token`: API access token (opaque)
- `expires_in`: Token validity duration in seconds
- `token_type`: Always `bearer`
- `scope`: Applied permission set
- `account_id`: API v2 account ID
- `team_id`: API v2 team ID (if applicable)
- `refresh_token`: Long-lived refresh token (if offline access)
- `id_token`: JWT token (if OIDC scopes included)

## User Endpoints

### Account Management

#### /account/set_profile_photo
**URL**: `https://api.dropboxapi.com/2/account/set_profile_photo`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `account.profile_photo`  
**Content-Type**: `application/json`

**Parameters**:
```json
{
  "photo": {
    ".tag": "base64_data",
    "base64_data": "image_base64_data"
  }
}
```

### User Information

#### /users/get_current_account
**URL**: `https://api.dropboxapi.com/2/users/get_current_account`  
**Method**: POST  
**Authentication**: User Authentication  
**Description**: Get current user's account information

**Returns**: Account details including name, email, account_id, etc.

#### /users/get_account
**URL**: `https://api.dropboxapi.com/2/users/get_account`  
**Method**: POST  
**Authentication**: User Authentication  
**Description**: Get account info by account ID

**Parameters**:
```json
{
  "account_id": "dbid:AAH4f99T0taONIb-OurWxbNQ6ywGRopQngc"
}
```

## File Operations

### Basic File Operations

#### /files/copy_v2
**URL**: `https://api.dropboxapi.com/2/files/copy_v2`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Parameters**:
```json
{
  "from_path": "/source/path",
  "to_path": "/destination/path",
  "autorename": false,
  "allow_ownership_transfer": false,
  "allow_shared_folder": false
}
```

#### /files/move_v2
**URL**: `https://api.dropboxapi.com/2/files/move_v2`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Parameters**:
```json
{
  "from_path": "/source/path",
  "to_path": "/destination/path",
  "autorename": false,
  "allow_ownership_transfer": false,
  "allow_shared_folder": false
}
```

#### /files/delete_v2
**URL**: `https://api.dropboxapi.com/2/files/delete_v2`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Parameters**:
```json
{
  "path": "/file_or_folder_path",
  "parent_rev": "optional_revision"
}
```

#### /files/restore
**URL**: `https://api.dropboxapi.com/2/files/restore`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Parameters**:
```json
{
  "path": "/file_path",
  "rev": "revision_id"
}
```

### File Upload Operations

#### /files/upload
**URL**: `https://content.dropboxapi.com/2/files/upload`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`  
**Content-Type**: `application/octet-stream`  
**Max File Size**: 150 MB

**Headers**:
- `Dropbox-API-Arg`: JSON with commit info

**Dropbox-API-Arg Example**:
```json
{
  "path": "/file_path",
  "mode": "add",
  "autorename": false,
  "mute": false,
  "property_groups": []
}
```

**Mode Options**:
- `add`: Create new file, fail if exists
- `overwrite`: Replace existing file
- `update`: Update specific file revision

#### Upload Sessions (for files > 150 MB)

##### /files/upload_session/start
**URL**: `https://content.dropboxapi.com/2/files/upload_session/start`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Parameters**:
```json
{
  "close": false
}
```

**Returns**:
```json
{
  "session_id": "AAAAAAAAAX8EKxD-MDIgQCOGZFAAAAA"
}
```

##### /files/upload_session/append_v2
**URL**: `https://content.dropboxapi.com/2/files/upload_session/append_v2`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Dropbox-API-Arg**:
```json
{
  "cursor": {
    "session_id": "AAAAAAAAAX8EKxD-MDIgQCOGZFAAAAA",
    "offset": 1024
  },
  "close": false
}
```

##### /files/upload_session/finish
**URL**: `https://content.dropboxapi.com/2/files/upload_session/finish`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Dropbox-API-Arg**:
```json
{
  "cursor": {
    "session_id": "AAAAAAAAAX8EKxD-MDIgQCOGZFAAAAA",
    "offset": 2048
  },
  "commit": {
    "path": "/final_file_path",
    "mode": "add",
    "autorename": false,
    "mute": false
  }
}
```

### File Download Operations

#### /files/download
**URL**: `https://content.dropboxapi.com/2/files/download`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.read`

**Dropbox-API-Arg**:
```json
{
  "path": "/file_path"
}
```

**Returns**: File content in response body, metadata in `Dropbox-API-Result` header

#### /files/get_temporary_link
**URL**: `https://api.dropboxapi.com/2/files/get_temporary_link`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.read`  
**Description**: Get temporary download link (valid 4 hours)

**Parameters**:
```json
{
  "path": "/file_path"
}
```

**Returns**:
```json
{
  "metadata": {
    "name": "file.txt",
    "path_lower": "/file.txt",
    "path_display": "/file.txt",
    "id": "id:a4ayc_80_OEAAAAAAAAAYa",
    "size": 12345
  },
  "link": "https://dl.dropboxusercontent.com/..."
}
```

### File Metadata Operations

#### /files/get_metadata
**URL**: `https://api.dropboxapi.com/2/files/get_metadata`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.read`

**Parameters**:
```json
{
  "path": "/file_or_folder_path",
  "include_media_info": false,
  "include_deleted": false,
  "include_has_explicit_shared_members": false
}
```

#### /files/list_folder
**URL**: `https://api.dropboxapi.com/2/files/list_folder`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.read`

**Parameters**:
```json
{
  "path": "/folder_path",
  "recursive": false,
  "include_media_info": false,
  "include_deleted": false,
  "include_has_explicit_shared_members": false,
  "include_mounted_folders": true,
  "limit": 2000
}
```

**Returns**:
```json
{
  "entries": [
    {
      ".tag": "file",
      "name": "file.txt",
      "path_lower": "/folder/file.txt",
      "path_display": "/folder/file.txt",
      "id": "id:a4ayc_80_OEAAAAAAAAAYa",
      "size": 12345,
      "server_modified": "2015-05-12T15:50:38Z",
      "client_modified": "2015-05-12T15:50:38Z",
      "rev": "a1c10ce0dd78"
    }
  ],
  "cursor": "AAF4f99T0taONIb-OurWxbNQ6ywGRopQngc",
  "has_more": false
}
```

#### /files/list_folder/continue
**URL**: `https://api.dropboxapi.com/2/files/list_folder/continue`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.read`

**Parameters**:
```json
{
  "cursor": "AAF4f99T0taONIb-OurWxbNQ6ywGRopQngc"
}
```

### File Search

#### /files/search_v2
**URL**: `https://api.dropboxapi.com/2/files/search_v2`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.read`

**Parameters**:
```json
{
  "query": "search term",
  "options": {
    "path": "/search/folder",
    "max_results": 100,
    "order_by": {
      ".tag": "relevance"
    },
    "file_status": {
      ".tag": "active"
    },
    "filename_only": false
  },
  "match_field_options": {
    "include_highlights": false
  }
}
```

### Thumbnails

#### /files/get_thumbnail_v2
**URL**: `https://content.dropboxapi.com/2/files/get_thumbnail_v2`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.read`

**Dropbox-API-Arg**:
```json
{
  "resource": {
    ".tag": "path",
    "path": "/image.jpg"
  },
  "format": {
    ".tag": "jpeg"
  },
  "size": {
    ".tag": "w256h256"
  },
  "mode": {
    ".tag": "strict"
  }
}
```

**Format Options**: `jpeg`, `png`, `webp`  
**Size Options**: `w32h32`, `w64h64`, `w128h128`, `w256h256`, `w480h320`, `w640h480`, `w960h640`, `w1024h768`, `w2048h1536`

### URL Save Operations

#### /files/save_url
**URL**: `https://api.dropboxapi.com/2/files/save_url`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Parameters**:
```json
{
  "path": "/saved_file.pdf",
  "url": "https://example.com/file.pdf"
}
```

**Returns**:
```json
{
  ".tag": "async_job_id",
  "async_job_id": "34g93hh34h04y384084"
}
```

#### /files/save_url/check_job_status
**URL**: `https://api.dropboxapi.com/2/files/save_url/check_job_status`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.content.write`

**Parameters**:
```json
{
  "async_job_id": "34g93hh34h04y384084"
}
```

## File Properties API

### Property Templates

#### /file_properties/templates/add_for_user
**URL**: `https://api.dropboxapi.com/2/file_properties/templates/add_for_user`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.write`

**Parameters**:
```json
{
  "name": "Security Template",
  "description": "Security classification properties",
  "fields": [
    {
      "name": "Classification",
      "description": "Security classification level",
      "type": {
        ".tag": "string"
      }
    }
  ]
}
```

#### /file_properties/templates/get_for_user
**URL**: `https://api.dropboxapi.com/2/file_properties/templates/get_for_user`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.read`

**Parameters**:
```json
{
  "template_id": "ptid:1a5n2i6d3OYEAAAAAAAAAYa"
}
```

### Property Operations

#### /file_properties/properties/add
**URL**: `https://api.dropboxapi.com/2/file_properties/properties/add`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.write`

**Parameters**:
```json
{
  "path": "/file_path",
  "property_groups": [
    {
      "template_id": "ptid:1a5n2i6d3OYEAAAAAAAAAYa",
      "fields": [
        {
          "name": "Classification",
          "value": "Confidential"
        }
      ]
    }
  ]
}
```

#### /file_properties/properties/search
**URL**: `https://api.dropboxapi.com/2/file_properties/properties/search`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `files.metadata.read`

**Parameters**:
```json
{
  "queries": [
    {
      "query": "Confidential",
      "mode": {
        ".tag": "field_name",
        "field_name": "Classification"
      },
      "logical_operator": {
        ".tag": "or_operator"
      }
    }
  ],
  "template_filter": {
    ".tag": "filter_some",
    "filter_some": ["ptid:1a5n2i6d3OYEAAAAAAAAAYa"]
  }
}
```

## Sharing API

### Shared Links

#### /sharing/create_shared_link_with_settings
**URL**: `https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "path": "/file_path",
  "settings": {
    "require_password": false,
    "link_password": "password123",
    "expires": "2025-12-31T23:59:59Z",
    "audience": {
      ".tag": "public"
    },
    "access": {
      ".tag": "viewer"
    },
    "allow_download": true
  }
}
```

**Access Levels**: `viewer`, `editor`, `owner`  
**Audience Types**: `public`, `team`, `no_one`, `password`, `members`

#### /sharing/list_shared_links
**URL**: `https://api.dropboxapi.com/2/sharing/list_shared_links`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.read`

**Parameters**:
```json
{
  "path": "/optional/filter/path",
  "cursor": "cursor_string",
  "direct_only": false
}
```

#### /sharing/revoke_shared_link
**URL**: `https://api.dropboxapi.com/2/sharing/revoke_shared_link`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "url": "https://www.dropbox.com/s/abc123/file.txt"
}
```

### Shared Folders

#### /sharing/share_folder
**URL**: `https://api.dropboxapi.com/2/sharing/share_folder`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "path": "/folder_to_share",
  "member_policy": {
    ".tag": "anyone"
  },
  "acl_update_policy": {
    ".tag": "editors"
  },
  "shared_link_policy": {
    ".tag": "anyone"
  },
  "force_async": false
}
```

#### /sharing/list_folders
**URL**: `https://api.dropboxapi.com/2/sharing/list_folders`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.read`

**Parameters**:
```json
{
  "limit": 100,
  "actions": []
}
```

#### /sharing/mount_folder
**URL**: `https://api.dropboxapi.com/2/sharing/mount_folder`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "shared_folder_id": "84528192421"
}
```

#### /sharing/unmount_folder
**URL**: `https://api.dropboxapi.com/2/sharing/unmount_folder`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "shared_folder_id": "84528192421"
}
```

### Folder Members

#### /sharing/add_folder_member
**URL**: `https://api.dropboxapi.com/2/sharing/add_folder_member`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "shared_folder_id": "84528192421",
  "members": [
    {
      ".tag": "email",
      "email": "user@example.com"
    }
  ],
  "quiet": false,
  "custom_message": "Welcome to the shared folder!"
}
```

#### /sharing/remove_folder_member
**URL**: `https://api.dropboxapi.com/2/sharing/remove_folder_member`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "shared_folder_id": "84528192421",
  "member": {
    ".tag": "email",
    "email": "user@example.com"
  },
  "leave_a_copy": false
}
```

#### /sharing/list_folder_members
**URL**: `https://api.dropboxapi.com/2/sharing/list_folder_members`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.read`

**Parameters**:
```json
{
  "shared_folder_id": "84528192421",
  "actions": [],
  "limit": 1000
}
```

### File Members

#### /sharing/add_file_member
**URL**: `https://api.dropboxapi.com/2/sharing/add_file_member`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.write`

**Parameters**:
```json
{
  "file": "/shared_file.txt",
  "members": [
    {
      ".tag": "email",
      "email": "user@example.com"
    }
  ],
  "custom_message": "Check out this file!",
  "quiet": false,
  "access_level": {
    ".tag": "viewer"
  },
  "add_message_as_comment": false
}
```

#### /sharing/list_file_members
**URL**: `https://api.dropboxapi.com/2/sharing/list_file_members`  
**Method**: POST  
**Authentication**: User Authentication  
**Scope**: `sharing.read`

**Parameters**:
```json
{
  "file": "/shared_file.txt",
  "actions": [],
  "include_inherited": true,
  "limit": 100
}
```

## Business Endpoints

### Team Information

#### /team/get_info
**URL**: `https://api.dropboxapi.com/2/team/get_info`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `team_info.read`

**Returns**:
```json
{
  "name": "Acme Inc.",
  "team_id": "dbtid:1234abcd",
  "num_licensed_users": 50,
  "num_provisioned_users": 45,
  "num_used_licenses": 40,
  "policies": {
    "sharing": {
      "shared_folder_member_policy": {
        ".tag": "team"
      },
      "shared_folder_join_policy": {
        ".tag": "from_anyone"
      },
      "shared_link_create_policy": {
        ".tag": "team_only"
      }
    }
  }
}
```

### Team Members

#### /team/members/add_v2
**URL**: `https://api.dropboxapi.com/2/team/members/add_v2`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `members.write`

**Parameters**:
```json
{
  "new_members": [
    {
      "member_email": "newuser@company.com",
      "member_given_name": "John",
      "member_surname": "Doe",
      "member_external_id": "employee_123",
      "send_welcome_email": true,
      "role_ids": ["pid_dbtmr:user"]
    }
  ],
  "force_async": false
}
```

#### /team/members/list_v2
**URL**: `https://api.dropboxapi.com/2/team/members/list_v2`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `members.read`

**Parameters**:
```json
{
  "limit": 1000,
  "include_removed": false
}
```

#### /team/members/get_info_v2
**URL**: `https://api.dropboxapi.com/2/team/members/get_info_v2`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `members.read`

**Parameters**:
```json
{
  "members": [
    {
      ".tag": "team_member_id",
      "team_member_id": "dbmid:efgh5678"
    }
  ]
}
```

#### /team/members/remove_v2
**URL**: `https://api.dropboxapi.com/2/team/members/remove_v2`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `members.delete`

**Parameters**:
```json
{
  "user": {
    ".tag": "team_member_id",
    "team_member_id": "dbmid:efgh5678"
  },
  "wipe_data": true,
  "transfer_dest_id": {
    ".tag": "team_member_id",
    "team_member_id": "dbmid:transfer_to"
  },
  "transfer_admin_id": {
    ".tag": "team_member_id", 
    "team_member_id": "dbmid:admin_user"
  },
  "keep_account": false
}
```

### Team Groups

#### /team/groups/create
**URL**: `https://api.dropboxapi.com/2/team/groups/create`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `groups.write`

**Parameters**:
```json
{
  "group_name": "Marketing Team",
  "add_creator_as_owner": false,
  "group_external_id": "marketing_001",
  "group_management_type": {
    ".tag": "user_managed"
  }
}
```

#### /team/groups/list
**URL**: `https://api.dropboxapi.com/2/team/groups/list`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `groups.read`

**Parameters**:
```json
{
  "limit": 1000
}
```

#### /team/groups/members/add
**URL**: `https://api.dropboxapi.com/2/team/groups/members/add`  
**Method**: POST  
**Authentication**: Team Authentication  
**Scope**: `groups.write`

**Parameters**:
```json
{
  "group": {
    ".tag": "group_id",
    "group_id": "g:e2db7665347abcd600000000001a2b3c"
  },
  "members": [
    {
      ".tag": "team_member_id",
      "team_member_id": "dbmid:efgh5678"
    }
  ],
  "return_members": true
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 400 | Bad input parameter |
| 401 | Bad or expired token |
| 403 | No permission to access endpoint/feature |
| 409 | Endpoint-specific error |
| 429 | Rate limited |
| 5xx | Server error |

### Error Response Format

**401 Unauthorized Example**:
```json
{
  "error_summary": "invalid_access_token/...",
  "error": {
    ".tag": "invalid_access_token"
  }
}
```

**409 Endpoint-Specific Error Example**:
```json
{
  "error_summary": "path/not_found/...",
  "error": {
    ".tag": "path",
    "path": {
      ".tag": "not_found"
    }
  },
  "user_message": "The file or folder could not be found."
}
```

## Rate Limiting

- **429 Status Code**: Too many requests
- **Retry-After Header**: Number of seconds to wait
- **Rate Limit Reasons**:
  - `too_many_requests`: General rate limiting
  - `too_many_write_operations`: Write operation overload

## Advanced Features

### Batch Operations
Many endpoints support batch operations for efficiency:
- `/files/copy_batch`
- `/files/move_batch`
- `/files/delete_batch`
- `/files/upload_session/finish_batch`

### Webhooks
Set up webhooks to receive notifications about file changes:
- User webhooks for individual accounts
- Team webhooks for business accounts
- Webhook verification required

### Select Headers
For business accounts, administrators can perform operations on behalf of team members:
- `Dropbox-API-Select-User`: Act as specific user
- `Dropbox-API-Select-Admin`: Act as specific admin

### Namespaces
Business accounts can work with shared folders using namespace IDs:
- Format: `ns:123456/path/to/file`
- Used for team folder operations
- Required for cross-team sharing

## SDK Information

Official SDKs available for:
- Python
- JavaScript/Node.js
- Java
- Swift (iOS)
- Objective-C
- .NET/C#

Community SDKs available for additional languages.

## Migration Notes

### API v1 to v2 Migration
- All v1 endpoints deprecated
- OAuth 2.0 required (OAuth 1.0 deprecated)
- New error format with 409 status codes
- Different parameter structures
- Updated endpoint URLs

This completes the comprehensive Dropbox API documentation covering all major endpoints, authentication methods, and functionality.