module.exports = (fn) => {
  return (req, res, next) => {
    //fn(req, res, next).catch((err) => next(err));
    //deixei o comando acima para ver como podemos resumir a chamada quando o parametro é o mesmo
    fn(req, res, next).catch(next);
  };
};
