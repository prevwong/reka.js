import * as React from 'react';

import { EditorContext } from './EditorContextProvider';

export const useEditor = () => React.useContext(EditorContext);
