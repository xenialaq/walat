let host = '';

$.fn.api.settings.api = {
  'get assets': `${host}/v1/assets`,
  'post asset': `${host}/v1/assets`,
  'put asset': `${host}/v1/assets`,
  'delete asset': `${host}/v1/assets/{id}`,
  'get asset by ID': `${host}/v1/assets/{id}`,

  'get pages': `${host}/v1/pages?exercise_id={id}`,
  'post page': `${host}/v1/pages`,
  'put page': `${host}/v1/pages`,
  'delete page': `${host}/v1/pages/{id}`,
  'get page by ID': `${host}/v1/pages/{id}`,

  'get exercises': `${host}/v1/exercises?lesson_id={id}`,
  'post exercise': `${host}/v1/exercises`,
  'put exercise': `${host}/v1/exercises`,
  'delete exercise': `${host}/v1/exercises/{id}`,
  'get exercise by ID': `${host}/v1/exercises/{id}`,
  'reorder exercise by ID': `${host}/v1/exercises/{id}/reorder`,

  'get lessons': `${host}/v1/lessons`,
  'post lesson': `${host}/v1/lessons`,
  'put lesson': `${host}/v1/lessons`,
  'delete lesson': `${host}/v1/lessons/{id}`,
  'get lesson by ID': `${host}/v1/lessons/{id}`,
  'reorder lesson by ID': `${host}/v1/lessons/{id}/reorder`,

  'get templates': `${host}/v1/templates`,
  'post template': `${host}/v1/templates`,
  'put template': `${host}/v1/templates`,
  'delete template': `${host}/v1/templates/{id}`,
  'get template by ID': `${host}/v1/templates/{id}`
};
