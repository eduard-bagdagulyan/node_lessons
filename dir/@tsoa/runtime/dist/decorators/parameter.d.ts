/**
 * Inject http Body
 *  @param {string} [name] properties name in body object
 */
export declare function Body(): Function;
/**
 * Inject value from body
 *
 * @param {string} [name] The name of the body parameter
 */
export declare function BodyProp(name?: string): Function;
/**
 * Inject http request
 */
export declare function Request(): Function;
/**
 * Inject value from Path
 *
 * @param {string} [name] The name of the path parameter
 */
export declare function Path(name?: string): Function;
/**
 * Inject value from query string
 *
 * @param {string} [name] The name of the query parameter
 */
export declare function Query(name?: string): Function;
/**
 * Inject value from Http header
 *
 * @param {string} [name] The name of the header parameter
 */
export declare function Header(name?: string): Function;
