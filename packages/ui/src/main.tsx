import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import Index from './routes/index.tsx';
import { NewEntry } from './routes/entries.new.tsx';
import { EditEntry } from './routes/entries.$id.edit.tsx';
import { NotFound } from './routes/NotFound.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Index />} />
          <Route path="/entries/new" element={<NewEntry />} />
          <Route path="/entries/:id/edit" element={<EditEntry />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
