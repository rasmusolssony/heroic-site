'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Navbar.module.scss';

const links = [
  { link: '/', label: 'Home' },
  { link: '/announcements/', label: 'Announcements' },
  { link: '/applications/', label: 'Applications' },
  { link: '/members/', label: 'Members' },
];

const Navbar = () => {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      data-active={active === link.link || undefined}
      className={classes.link}
      onClick={() => {
        setActive(link.link);
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
};

export default Navbar;
