import { IsValidHeader } from '../utils/isHeaderType';
export declare function SuccessResponse<HeaderType extends IsValidHeader<HeaderType> = {}>(name: string | number, description?: string): Function;
export declare function Response<ExampleType, HeaderType extends IsValidHeader<HeaderType> = {}>(name: string | number, description?: string, example?: ExampleType): Function;
/**
 * Inject a library-agnostic responder function that can be used to construct type-checked (usually error-) responses.
 *
 * The type of the responder function should be annotated `TsoaResponse<Status, Data, Headers>` in order to support OpenAPI documentation.
 */
export declare function Res(): Function;
