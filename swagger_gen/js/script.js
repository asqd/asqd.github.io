const dateRegex = /^([0-9]{2})?[0-9]{2}(\/|-|.)(1[0-2]|0[1-9])\2(3[01]|[12][0-9]|0[1-9])$/
const dateTimeRegex = /^([0-9]{2})?[0-9]{2}(\/|-|.)(3[01]|[12][0-9]|0[1-9])\2(1[0-2]|0[1-9])(T[0-2][0-9]:[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?Z?)/
const intRegex = /^[0-9]+$/
const floatRegex = /[+-]?([0-9]*[.])?[0-9]+/
const booleanRegex = /^(?:true|false)$/i
const codeMessages = {
  200: 'Success',
  201: 'Created',
  401: 'Unauthorized',
  404: 'Not Found',
  422: 'Unprocessable Content'
}

function debounce(callback, milliseconds) {
  let timeout;

  return (argument) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(argument), milliseconds);
  };
}

function parseQueryParams(queryString) {
  const queryParams = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of queryParams) {
    result[key] = convertValue(value);
  }

  return result;
}

function convertValue(value) {
  if (intRegex.test(value)) {
    return parseInt(value, 10);
  } else if (floatRegex.test(value)) {
    return parseFloat(value);
  } else if (booleanRegex.test(value)) {
    return value === 'true'
  } else {
    return value;
  }
}


function composeObjectTypeSchema(data) {
  const schema = { type: 'object', properties: {}, example: data };
  const required = [];

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      schema.properties[key] = generateSchemaRecursive(data[key]);
      // required.push(key);
    }
  }

  schema.required = required;

  return schema;
}

function composeArrayTypeSchema(data) {
  if (data.length === 0) {
    return { type: 'array' };
  }
  const itemsSchema = generateSchemaRecursive(data[0]);

  return { type: 'array', items: itemsSchema, example: data };
}

function composeStringTypeSchema(data) {
  const schema = { type: 'string', example: data };
  if (data.match(dateRegex) !== null) schema['format'] = 'date';
  if (data.match(dateTimeRegex) !== null) schema['format'] = 'datetime';

  return schema;
}

function composeDataTypeSchema(data) {
  if (Array.isArray(data)) {
    return composeArrayTypeSchema(data)
  } else if (typeof data === 'object' && data !== null) {
    return composeObjectTypeSchema(data)
  } else if (typeof data === 'number') {
    if (Number.isInteger(data)) {
      return { type: 'integer', example: data };
    } else {
      return { type: 'number', example: data };
    }
  } else if (typeof data === 'boolean') {
    return { type: 'boolean', example: data };
  } else if (data === null) {
    return { type: 'string' };
  } else if (typeof data === 'string') {
    return composeStringTypeSchema(data)
  } else {
    throw new Error('Unsupported data type: ' + typeof data);
  }
}


const timeOut = 500
let prevJsonSize = 0
function generateSchema() {
  document.getElementById('loader').hidden = false;
  document.getElementById('schemaOutput').value = '';
  debounce(() => {
    try {
      const jsonInput = document.getElementById('jsonInput').value;

      if (jsonInput.size === prevJsonSize) return

      prevJsonSize = jsonInput.length
      const data = JSON.parse(jsonInput);
      const schema = generateSchemaRecursive(data);

      document.getElementById('schemaOutput').value = JSON.stringify(schema, null, 2);
      document.getElementById('errorOutput').textContent = '';
    } catch (error) {
      document.getElementById('schemaOutput').value = '';
      document.getElementById('errorOutput').textContent = error.message;
    }
    document.getElementById('loader').hidden = true;
  }, timeOut)
}

function generateSchemaRecursive(data) {
  return composeDataTypeSchema(data)
}

document.getElementById('addResponse').addEventListener('click', function () {
  const responseFields = document.getElementById('responseFields');

  const newResponseField = document.querySelector('.response-field').cloneNode(true);
  newResponseField.querySelector('.responseCode').value = '200';
  newResponseField.querySelector('.responseCode').addEventListener('change', generateSwagger)
  newResponseField.querySelector('.exampleName').value = '';
  newResponseField.querySelector('.serverResponse').value = '';
  newResponseField.querySelector('.serverResponseError').textContent = '';
  newResponseField.querySelectorAll('textarea, input').forEach((el) => el.addEventListener('input', debounce(generateSwagger, timeOut)));

  const removeButton = newResponseField.querySelector('.remove-response');
  removeButton.hidden = false
  removeButton.addEventListener('click', function () {
    responseFields.removeChild(newResponseField);
    generateSwagger()
  });

  responseFields.appendChild(newResponseField);
});

function requestParamsSchema(requestBody) {
  queryParams = parseQueryParams(requestBody)

  return Object.entries(queryParams).map(([key, value]) => {
    const schema = generateSchemaRecursive(value)

    return {
      name: key,
      in: 'query',
      required: true,
      schema: schema
    }
  });
}

function requestJSONSchema(requestBody) {
  const parsedRequestBody = JSON.parse(requestBody);

  return {
    content: {
      'application/json': {
        schema: generateSchemaRecursive(parsedRequestBody)
      }
    }
  };
}

function requestUrlencodedSchema(requestBody) {
  const boundary = requestBody.match(/--[a-zA-Z]=([^\n\r]+)/);
  if (!boundary) {
    document.getElementById('requestBodyErrors').textContent = 'Invalid Content-Disposition boundary.';
    return;
  }

  const boundaryValue = boundary[1];

  const parts = requestBody.split(`--${boundaryValue}`);
  const formData = {};

  parts.forEach(part => {
    if (part.trim() === '--') {
      return;
    }

    const fieldMatch = part.match(/name="(.+)"[\s\S]*\n\n([\s\S]*)\n$/);
    if (!fieldMatch) {
      document.getElementById('requestBodyErrors').textContent = 'Invalid field format.';
      return;
    }

    const fieldName = fieldMatch[1];
    const fieldValue = fieldMatch[2];
    formData[fieldName] = fieldValue.trim();
  });

  return {
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: formData
        }
      }
    }
  };
}

function generateSwagger() {
  const httpVerb = document.getElementById('httpVerb').value;
  const endpoint = document.getElementById('endpoint').value;
  const requestBodyType = document.getElementById('requestBodyType').value;
  const requestBody = document.getElementById('requestBody').value;
  const swaggerFormat = document.getElementById('swaggerFormat').value;


  const swaggerEndpoint = {
    path: endpoint,
    method: httpVerb,
    parameters: []
  };

  const responses = {};


  if (requestBody) {
    try {
      if (requestBodyType === 'query-params') {
        swaggerEndpoint.parameters.push(...requestParamsSchema(requestBody))
      } else if (requestBodyType === 'application-json') {
        swaggerEndpoint.requestBody = requestJSONSchema(requestBody)
      } else if (requestBodyType === 'multipart/form-data') {
        swaggerEndpoint.requestBody = requestUrlencodedSchema(requestBody)
      }

      document.getElementById('requestBodyErrors').textContent = '';
    } catch (error) {
      document.getElementById('requestBodyErrors').textContent = 'Request Body Error: ' + error.message;
      return;
    }
  } else {
    document.getElementById('requestBodyErrors').textContent = '';
  }

  const responseFields = document.querySelectorAll('.response-field');
  responseFields.forEach(function (field) {
    const responseCode = field.querySelector('.responseCode').value;
    const exampleName = field.querySelector('.exampleName').value;
    const serverResponse = field.querySelector('.serverResponse').value;
    const serverResponseError = field.querySelector('.serverResponseError');

    if (serverResponse) {
      try {
        const parsedServerResponse = JSON.parse(serverResponse);
        const schema = generateSchemaRecursive(parsedServerResponse);

        responses[responseCode] ||= {
          description: codeMessages[Number(responseCode)],
          content: {
            'application/json': {
              schema
            }
          }
        };

        if (exampleName) {
          responses[responseCode].examples ||= {}
          responses[responseCode].examples[exampleName] = {
            value: parsedServerResponse
          };
        }

        serverResponseError.textContent = ''
      } catch (error) {
        console.log('error', error.message);
        console.log('error', document.getElementById('requestBodyErrors').textContent = 's');
        serverResponseError.textContent = 'Server Response Error: ' + error.message;
        return;
      }
    }
  });

  if (Object.keys(responses).length > 0) {
    swaggerEndpoint.responses = responses;
  }

  const { path, method, ...others } = swaggerEndpoint
  const swaggerEndpointResult = {
    [path]: {
      [method.toLocaleLowerCase()]: others
    }
  }

  const useYAML = swaggerFormat == 'YAML'
  const swaggerOutput = useYAML ? jsyaml.dump(swaggerEndpointResult) : JSON.stringify(swaggerEndpointResult, null, 2);

  document.getElementById('swaggerOutput').textContent = swaggerOutput;
}

function copyFunction() {
  const text = document.getElementById("swaggerOutput").textContent;
  const textArea = document.getElementById('clipboard');
  textArea.textContent = text;
  textArea.select();
  document.execCommand("copy");
  document.getElementById('copyButton').textContent = 'Copied!'
  setTimeout(() => { document.getElementById('copyButton').textContent = 'Copy code' }, 1000)
}

document.getElementById('copyButton').addEventListener('click', copyFunction);
document.querySelectorAll('select').forEach((el) => el.addEventListener('change', generateSwagger));
document.querySelectorAll('textarea, input').forEach((el) => el.addEventListener('input', debounce(generateSwagger, timeOut)));
