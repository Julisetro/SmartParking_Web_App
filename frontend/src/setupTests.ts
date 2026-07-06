// El método import '@testing-library/jest-dom' a veces no es suficiente para que TypeScript
// infiera los tipos correctamente en configuraciones complejas.
// Este enfoque es más explícito y robusto para extender las aserciones de Vitest.

import '@testing-library/jest-dom/vitest'; // Importa los matchers y sus tipos globalmente para Vitest
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
