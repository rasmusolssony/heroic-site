import { Box, Title } from '@mantine/core';

import ApplicationForm from './applicationForm';

const Applications = () => {
  return (
    <Box ta="center">
      <Title mb={4} order={1}>
        Applications
      </Title>
      <Box maw="600px" mx="auto" p={6} ta="left">
        <ApplicationForm />
      </Box>
    </Box>
  );
};

export default Applications;
