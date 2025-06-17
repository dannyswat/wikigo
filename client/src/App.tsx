import { SetupRoutes, WikiGoRoutes } from "./routes";

import './App.css';
import SettingProvider from "./features/setup/SettingProvider";

export default function App() {
  return (<SettingProvider setup={<SetupRoutes />}><WikiGoRoutes /></SettingProvider>);
}
