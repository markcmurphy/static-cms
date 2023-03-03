import { Menu as BaseMenu, Transition } from '@headlessui/react';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon';
import React, { useMemo } from 'react';

import classNames from '@staticcms/core/lib/util/classNames.util';
import useButtonClassNames from '../button/useButtonClassNames';

import type { FC, ReactNode } from 'react';

export interface MenuProps {
  label: ReactNode;
  startIcon?: FC<{ className?: string }>;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary';
  rounded?: boolean | 'no-padding';
  className?: string;
  children: ReactNode | ReactNode[];
  hideDropdownIcon?: boolean;
  'data-testid'?: string;
}

const Menu = ({
  label,
  startIcon: StartIcon,
  variant = 'contained',
  color = 'primary',
  rounded = false,
  className,
  children,
  hideDropdownIcon = false,
  'data-testid': dataTestId,
}: MenuProps) => {
  const buttonClassName = useButtonClassNames(variant, color, rounded);

  const menuButtonClassNames = useMemo(
    () => classNames(className, buttonClassName),
    [buttonClassName, className],
  );

  return (
    <BaseMenu as="div" className="relative text-left flex items-center">
      <BaseMenu.Button className={menuButtonClassNames} data-testid={dataTestId}>
        {StartIcon ? <StartIcon className="-ml-0.5 mr-1.5 h-5 w-5" /> : null}
        {label}
        {!hideDropdownIcon ? (
          <ChevronDownIcon className="-mr-0.5 ml-2 h-5 w-5" aria-hidden="true" />
        ) : null}
      </BaseMenu.Button>
      <Transition
        as="div"
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className="z-30"
      >
        <BaseMenu.Items className="absolute right-0 z-30 mt-6 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none divide-y divide-gray-100 dark:divide-gray-600">
          {children}
        </BaseMenu.Items>
      </Transition>
    </BaseMenu>
  );
};

export default Menu;
