const toLowerCase = Function.call.bind(''.toLowerCase);

function formatBuilderName(type) {
  return type.replace(/^([A-Z](?=[a-z0-9])|[A-Z]+(?=[A-Z]))/, toLowerCase);
}

module.exports = formatBuilderName;
