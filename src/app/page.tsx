import { Box, Heading, Text } from '@chakra-ui/react';

const Home = () => {
  return (
    <Box
      p={6}
      textAlign="center"
      bg="gray.900"
      color="white"
      minH="calc(100vh - 64px)"
    >
      <Heading as="h1" size="4xl" mb={4}>
        Welcome to Heroic
      </Heading>
      <Text>Stay tuned for more updates!</Text>
    </Box>
  );
};
export default Home;
