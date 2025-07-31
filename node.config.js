// Node.js configuration for TypeScript module resolution
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register TypeScript loader
register('ts-node/esm', pathToFileURL('./')); 