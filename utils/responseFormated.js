exports.responseArray = (data, time) => {
  return {
    status: 'success',
    time: new Date() - time,
    results: data.length,
    data: data,
  };
};

exports.responseObject = (data, time) => {
  return {
    status: 'success',
    time: new Date() - time,
    data: data,
  };
};

exports.responseMessage = (message) => {
  return {
    status: 'success',
    message: message,
  };
};

exports.responseSuccess = () => {
  return {
    status: 'success',
  };
};

exports.responseToken = (token, data) => {
  return {
    status: 'success',
    token: token,
    data: data,
  };
};
