export interface StoredToken {
    user_id: string
    expires_at: number
    access_token: string
    refresh_token: string
    loa: number
    token_type: string
    expires_in: number
    scope: string
    principal: string
}

export interface Token {
    access_token: string
    refresh_token: string
    loa: number
    token_type: string
    expires_in: number
    scope: string
    principal: string
}

export interface TokenError {
    status: number
    error_description: string
}

export interface TokenStore {
    get(user_id: string): Promise<StoredToken | null>
    upsert(token: StoredToken): Promise<void>
    delete(user_id: string): Promise<boolean>
}
