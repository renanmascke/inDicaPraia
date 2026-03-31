declare module 'swagger-ui-react' {
  import { ComponentType } from 'react';
  
  export interface SwaggerUIProps {
    url?: string;
    spec?: object;
    layout?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelExpandDepth?: number;
    presets?: any[];
    plugins?: any[];
    supportedSubmitMethods?: string[];
    [key: string]: any;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
