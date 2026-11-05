/** The number of open sheets that hold the lock. Two sheets can be open at once, for example a sheet over a sheet. */
let lockCount = 0;
/** The inline value of `overflow` on the body before the first lock. */
let previousOverflow = "";

/**
 * Stops the page behind a sheet from scrolling, and returns the function that releases this lock.
 * The first lock changes the body. Only the last release restores the body, so a sheet that closes over another
 * open sheet does not unlock the page. A second call of the same release function does nothing.
 */
export function lockPageScroll(): () => void {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount -= 1;
    if (lockCount === 0) document.body.style.overflow = previousOverflow;
  };
}
