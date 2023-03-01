import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Button from '@staticcms/core/components/common/button/Button';
import Field from '@staticcms/core/components/common/field/Field';
import Image from '@staticcms/core/components/common/image/Image';
import Link from '@staticcms/core/components/common/link/Link';
import useMediaInsert from '@staticcms/core/lib/hooks/useMediaInsert';
import useUUID from '@staticcms/core/lib/hooks/useUUID';
import { basename } from '@staticcms/core/lib/util';
import { isEmpty } from '@staticcms/core/lib/util/string.util';
import SortableImage from './components/SortableImage';

import type { FileOrImageField, WidgetControlProps } from '@staticcms/core/interface';
import type { FC, MouseEvent } from 'react';

const MAX_DISPLAY_LENGTH = 50;

function isMultiple(value: string | string[] | null | undefined): value is string[] {
  return Array.isArray(value);
}

export function getValidFileValue(value: string | string[] | null | undefined) {
  if (value) {
    return isMultiple(value) ? value.map(v => basename(v)) : basename(value);
  }

  return value;
}

export interface WithFileControlProps {
  forImage?: boolean;
}

const withFileControl = ({ forImage = false }: WithFileControlProps = {}) => {
  const FileControl: FC<WidgetControlProps<string | string[], FileOrImageField>> = memo(
    ({
      value,
      label,
      collection,
      field,
      errors,
      forSingleList,
      duplicate,
      onChange,
      openMediaLibrary,
      clearMediaControl,
      removeMediaControl,
      hasErrors,
      disabled,
      t,
    }) => {
      const controlID = useUUID();
      const [internalRawValue, setInternalValue] = useState(value ?? '');
      const internalValue = useMemo(
        () => (duplicate ? value ?? '' : internalRawValue),
        [internalRawValue, duplicate, value],
      );

      const uploadButtonRef = useRef<HTMLButtonElement | null>(null);

      const handleOnChange = useCallback(
        (newValue: string | string[]) => {
          if (newValue !== internalValue) {
            setInternalValue(newValue);
            setTimeout(() => {
              onChange(newValue);
            });
          }
        },
        [internalValue, onChange],
      );

      const handleOpenMediaLibrary = useMediaInsert(
        internalValue,
        { collection, field, controlID, forImage },
        handleOnChange,
      );

      useEffect(() => {
        return () => {
          removeMediaControl(controlID);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const mediaLibraryFieldOptions = useMemo(() => {
        return field.media_library ?? {};
      }, [field.media_library]);

      const config = useMemo(
        () => ('config' in mediaLibraryFieldOptions ? mediaLibraryFieldOptions.config : undefined),
        [mediaLibraryFieldOptions],
      );

      const allowsMultiple = useMemo(() => {
        return config?.multiple ?? false;
      }, [config?.multiple]);

      const chooseUrl = useMemo(
        () =>
          'choose_url' in mediaLibraryFieldOptions && (mediaLibraryFieldOptions.choose_url ?? true),
        [mediaLibraryFieldOptions],
      );

      const handleUrl = useCallback(
        (subject: 'image' | 'file') => (e: MouseEvent) => {
          e.preventDefault();

          const url = window.prompt(t(`editor.editorWidgets.${subject}.promptUrl`));

          handleOnChange(url ?? '');
        },
        [handleOnChange, t],
      );

      const handleRemove = useCallback(
        (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          clearMediaControl(controlID);
          handleOnChange('');
        },
        [clearMediaControl, controlID, handleOnChange],
      );

      const onRemoveOne = useCallback(
        (index: number) => () => {
          if (Array.isArray(internalValue)) {
            const newValue = [...internalValue];
            newValue.splice(index, 1);
            handleOnChange(newValue);
          }
        },
        [handleOnChange, internalValue],
      );

      const onReplaceOne = useCallback(
        (index: number) => () => {
          return openMediaLibrary({
            controlID,
            forImage,
            value: internalValue,
            replaceIndex: index,
            allowMultiple: false,
            config,
            collection,
            field,
          });
        },
        [openMediaLibrary, controlID, internalValue, config, collection, field],
      );

      // TODO Readd when multiple uploads is supported
      // const onSortEnd = useCallback(
      //   ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      //     if (Array.isArray(internalValue)) {
      //       const newValue = arrayMoveImmutable(internalValue, oldIndex, newIndex);
      //       handleOnChange(newValue);
      //     }
      //   },
      //   [handleOnChange, internalValue],
      // );

      const renderFileLink = useCallback(
        (link: string | undefined | null) => {
          if (!link) {
            return null;
          }

          const text =
            link.length <= MAX_DISPLAY_LENGTH
              ? link
              : `${link.slice(0, MAX_DISPLAY_LENGTH / 2)}\u2026${link.slice(
                  -(MAX_DISPLAY_LENGTH / 2) + 1,
                )}`;

          return (
            <Link href={link} collection={collection} field={field}>
              {text}
            </Link>
          );
        },
        [collection, field],
      );

      const renderedImagesLinks = useMemo(() => {
        if (forImage) {
          if (!internalValue) {
            return null;
          }

          if (isMultiple(internalValue)) {
            return (
              <div key="multi-image-wrapper">
                {internalValue.map((itemValue, index) => (
                  <SortableImage
                    key={`item-${itemValue}`}
                    itemValue={itemValue}
                    collection={collection}
                    field={field}
                    onRemove={onRemoveOne(index)}
                    onReplace={onReplaceOne(index)}
                  />
                ))}
              </div>
            );
          }

          return (
            <div key="single-image-wrapper">
              <Image key="single-image" src={internalValue} collection={collection} field={field} />
            </div>
          );
        }

        if (isMultiple(internalValue)) {
          return (
            <div key="mulitple-file-links">
              <ul key="file-links-list">
                {internalValue.map(val => (
                  <li key={val}>{renderFileLink(val)}</li>
                ))}
              </ul>
            </div>
          );
        }

        return <div key="single-file-links">{renderFileLink(internalValue)}</div>;
      }, [collection, field, internalValue, onRemoveOne, onReplaceOne, renderFileLink]);

      const content: JSX.Element = useMemo(() => {
        const subject = forImage ? 'image' : 'file';

        if (Array.isArray(internalValue) ? internalValue.length === 0 : isEmpty(internalValue)) {
          return (
            <div key="selection" className="flex flex-col gap-2 px-3 pt-2 pb-4">
              <div key="controls" className="flex gap-2">
                <Button
                  buttonRef={uploadButtonRef}
                  color="primary"
                  variant="outlined"
                  key="upload"
                  onClick={handleOpenMediaLibrary}
                  data-testid="choose-upload"
                  disabled={disabled}
                >
                  {t(`editor.editorWidgets.${subject}.choose${allowsMultiple ? 'Multiple' : ''}`)}
                </Button>
                {chooseUrl ? (
                  <Button
                    color="primary"
                    variant="outlined"
                    key="choose-url"
                    onClick={handleUrl(subject)}
                    data-testid="choose-url"
                    disabled={disabled}
                  >
                    {t(`editor.editorWidgets.${subject}.chooseUrl`)}
                  </Button>
                ) : null}
              </div>
            </div>
          );
        }

        return (
          <div key="selection" className="flex flex-col gap-2 px-3 pt-2 pb-4">
            {renderedImagesLinks}
            <div key="controls" className="flex gap-2">
              <Button
                buttonRef={uploadButtonRef}
                color="primary"
                variant="outlined"
                key="add-replace"
                onClick={handleOpenMediaLibrary}
                data-testid="add-replace-upload"
                disabled={disabled}
              >
                {t(
                  `editor.editorWidgets.${subject}.${
                    allowsMultiple ? 'addMore' : 'chooseDifferent'
                  }`,
                )}
              </Button>
              {chooseUrl && !allowsMultiple ? (
                <Button
                  color="primary"
                  variant="outlined"
                  key="replace-url"
                  onClick={handleUrl(subject)}
                  data-testid="replace-url"
                  disabled={disabled}
                >
                  {t(`editor.editorWidgets.${subject}.replaceUrl`)}
                </Button>
              ) : null}
              <Button
                color="error"
                variant="outlined"
                key="remove"
                onClick={handleRemove}
                data-testid="remove-upload"
                disabled={disabled}
              >
                {t(`editor.editorWidgets.${subject}.remove${allowsMultiple ? 'All' : ''}`)}
              </Button>
            </div>
          </div>
        );
      }, [
        internalValue,
        renderedImagesLinks,
        handleOpenMediaLibrary,
        t,
        allowsMultiple,
        chooseUrl,
        handleUrl,
        handleRemove,
      ]);

      return useMemo(
        () => (
          <Field
            inputRef={uploadButtonRef}
            label={label}
            errors={errors}
            noPadding={!hasErrors}
            hint={field.hint}
            forSingleList={forSingleList}
            cursor="pointer"
          >
            {content}
          </Field>
        ),
        [content, errors, field.hint, forSingleList, hasErrors, label],
      );
    },
  );

  FileControl.displayName = 'FileControl';

  return FileControl;
};

export default withFileControl;
