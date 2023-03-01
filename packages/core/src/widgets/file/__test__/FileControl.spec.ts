/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { mockFileField } from '@staticcms/test/data/fields.mock';
import { createWidgetControlHarness } from '@staticcms/test/harnesses/widget.harness';
import withFileControl from '../withFileControl';

const FileControl = withFileControl();

describe(FileControl.name, () => {
  const renderControl = createWidgetControlHarness(FileControl, { field: mockFileField });

  fit('should render', () => {
    const { getByTestId } = renderControl({ label: 'I am a label' });

    const label = getByTestId('label');
    expect(label.textContent).toBe('I am a label');
    expect(label).toHaveClass('text-slate-500');

    const field = getByTestId('field');
    expect(field).toHaveClass('group/active');

    const fieldWrapper = getByTestId('field-wrapper');
    expect(fieldWrapper).not.toHaveClass('mr-14');

    // String Widget uses pointer cursor
    expect(label).toHaveClass('cursor-pointer');
    expect(field).toHaveClass('cursor-pointer');

    // String Widget uses default label layout, without bottom padding on field
    expect(label).toHaveClass('px-3', 'pt-3');
    expect(field).not.toHaveClass('pb-3');
  });

  fit('should show only the choose upload button by default', () => {
    const { getByTestId, queryByTestId } = renderControl({ label: 'I am a label' });

    expect(getByTestId('choose-upload')).toBeInTheDocument();
    expect(queryByTestId('choose-url')).not.toBeInTheDocument();
    expect(queryByTestId('add-replace-upload')).not.toBeInTheDocument();
    expect(queryByTestId('replace-url')).not.toBeInTheDocument();
    expect(queryByTestId('remove-upload')).not.toBeInTheDocument();
  });

  fit('should show only the choose upload and choose url buttons by default when choose url is true', () => {
    const { getByTestId, queryByTestId } = renderControl({
      label: 'I am a label',
      field: { ...mockFileField, media_library: { choose_url: true } },
    });

    expect(getByTestId('choose-upload')).toBeInTheDocument();
    expect(getByTestId('choose-url')).toBeInTheDocument();
    expect(queryByTestId('add-replace-upload')).not.toBeInTheDocument();
    expect(queryByTestId('replace-url')).not.toBeInTheDocument();
    expect(queryByTestId('remove-upload')).not.toBeInTheDocument();
  });

  fit('should show only the add/replace upload and remove buttons by there is a value', () => {
    const { getByTestId, queryByTestId } = renderControl({
      label: 'I am a label',
      value: 'https://example.com/file.pdf',
    });

    expect(queryByTestId('choose-upload')).not.toBeInTheDocument();
    expect(queryByTestId('choose-url')).not.toBeInTheDocument();
    expect(getByTestId('add-replace-upload')).toBeInTheDocument();
    expect(queryByTestId('replace-url')).not.toBeInTheDocument();
    expect(getByTestId('remove-upload')).toBeInTheDocument();
  });

  fit('should show the add/replace upload, replace url and remove buttons by there is a value and choose url is true', () => {
    const { getByTestId, queryByTestId } = renderControl({
      label: 'I am a label',
      field: { ...mockFileField, media_library: { choose_url: true } },
      value: 'https://example.com/file.pdf',
    });

    expect(queryByTestId('choose-upload')).not.toBeInTheDocument();
    expect(queryByTestId('choose-url')).not.toBeInTheDocument();
    expect(getByTestId('add-replace-upload')).toBeInTheDocument();
    expect(getByTestId('replace-url')).toBeInTheDocument();
    expect(getByTestId('remove-upload')).toBeInTheDocument();
  });

  fit('should render as single list item', () => {
    const { getByTestId } = renderControl({ label: 'I am a label', forSingleList: true });

    const fieldWrapper = getByTestId('field-wrapper');
    expect(fieldWrapper).toHaveClass('mr-14');
  });

  fit('should only use prop value as initial value', async () => {
    const { rerender, getByTestId } = renderControl({ value: 'https://example.com/file.pdf' });

    const link = getByTestId('link');
    expect(link.textContent).toBe('https://example.com/file.pdf');

    rerender({ value: 'https://example.com/someoether.pdf' });
    expect(link.textContent).toBe('https://example.com/file.pdf');
  });

  fit('should use prop value exclusively if field is i18n duplicate', async () => {
    const { rerender, getByTestId } = renderControl({
      field: { ...mockFileField, i18n: 'duplicate' },
      duplicate: true,
      value: 'https://example.com/file.pdf',
    });

    const link = getByTestId('link');
    expect(link.textContent).toBe('https://example.com/file.pdf');

    rerender({ value: 'https://example.com/someoether.pdf' });
    expect(link.textContent).toBe('https://example.com/someoether.pdf');
  });

  it('should call onChange when text input changes', async () => {
    const {
      getByTestId,
      props: { onChange },
    } = renderControl();

    const input = getByTestId('text-input');

    await userEvent.type(input, 'I am some text');

    expect(onChange).toHaveBeenLastCalledWith('I am some text');
  });

  fit('should show error', async () => {
    const { getByTestId } = renderControl({
      errors: [{ type: 'error-type', message: 'i am an error' }],
    });

    const error = getByTestId('error');
    expect(error.textContent).toBe('i am an error');

    const field = getByTestId('field');
    expect(field).not.toHaveClass('group/active');

    const label = getByTestId('label');
    expect(label).toHaveClass('text-red-500');
  });

  it('should focus input on field click', async () => {
    const { getByTestId } = renderControl();

    const input = getByTestId('text-input');
    expect(input).not.toHaveFocus();

    const field = getByTestId('field');
    await userEvent.click(field);

    expect(input).toHaveFocus();
  });

  describe('disabled', () => {
    fit('should show only the choose upload button by default', () => {
      const { getByTestId } = renderControl({ label: 'I am a label', disabled: true });

      expect(getByTestId('choose-upload')).toBeDisabled();
    });

    fit('should show only the choose upload and choose url buttons by default when choose url is true', () => {
      const { getByTestId } = renderControl({
        label: 'I am a label',
        field: { ...mockFileField, media_library: { choose_url: true } },
        disabled: true,
      });

      expect(getByTestId('choose-upload')).toBeDisabled();
      expect(getByTestId('choose-url')).toBeDisabled();
    });

    fit('should show only the add/replace upload and remove buttons by there is a value', () => {
      const { getByTestId } = renderControl({
        label: 'I am a label',
        value: 'https://example.com/file.pdf',
        disabled: true,
      });

      expect(getByTestId('add-replace-upload')).toBeDisabled();
      expect(getByTestId('remove-upload')).toBeDisabled();
    });

    fit('should show the add/replace upload, replace url and remove buttons by there is a value and choose url is true', () => {
      const { getByTestId } = renderControl({
        label: 'I am a label',
        field: { ...mockFileField, media_library: { choose_url: true } },
        value: 'https://example.com/file.pdf',
        disabled: true,
      });

      expect(getByTestId('add-replace-upload')).toBeDisabled();
      expect(getByTestId('replace-url')).toBeDisabled();
      expect(getByTestId('remove-upload')).toBeDisabled();
    });
  });
});
