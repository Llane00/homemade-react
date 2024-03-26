let rIC = (typeof requestIdleCallback === 'undefined') ? function (callback) {
  return setTimeout(() => {
    callback({
      timeRemaining() {
        return Infinity;
      },
    });
  });
} : requestIdleCallback;

const pollify = {
  rIC,
}

export default pollify;
