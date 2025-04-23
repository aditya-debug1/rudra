/**
 * Higher-order function that wraps an event handler to stop event propagation
 * before executing the original handler.
 *
 * @param handler - Optional event handler function to execute after stopping propagation
 * @returns A new function that stops propagation and then calls the original handler
 * @example
 * // Usage example:
 * <button onClick={withStopPropagation(onClick)}>Click me</button>
 */
const withStopPropagation = <T extends React.SyntheticEvent>(
  handler?: (e: T) => void,
) => {
  return (e: T) => {
    e.stopPropagation();
    handler?.(e);
  };
};

export default withStopPropagation;
