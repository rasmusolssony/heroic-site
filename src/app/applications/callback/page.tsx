import { Suspense } from 'react';
import DiscordCallback from './DiscordCallback';

const DiscordCallbackPage = () => {
  return (
    <Suspense fallback={<div> Processing Discord authentication... </div>}>
      <DiscordCallback />
    </Suspense>
  );
};

export default DiscordCallbackPage;
