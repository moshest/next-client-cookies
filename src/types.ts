export interface Cookies {
  /**
   * Create a cookie
   */
  set(
    name: string,
    value: string,
    options?: CookieAttributes,
  ): string | undefined;

  /**
   * Read cookie
   */
  get(name: string): string | undefined;

  /**
   * Read all available cookies
   */
  get(): { [key: string]: string };

  /**
   * Delete cookie
   */
  remove(name: string, options?: CookieAttributes): void;
}

export interface CookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date | undefined;

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string | undefined;

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string | undefined;

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean | undefined;

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined;
}
