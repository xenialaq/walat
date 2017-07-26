let host = '';

$.fn.api.settings.api = {
  'get assets': `${host}/v1/assets`,
  'post an asset': `${host}/v1/assets`,
  'put an asset': `${host}/v1/assets`,
  'delete an asset': `${host}/v1/assets/{id}`,
  'get asset by ID': `${host}/v1/assets/{id}`,

  'get pages': `${host}/v1/pages?exercise_id={id}`,
  'post a page': `${host}/v1/pages`,
  'put a page': `${host}/v1/pages`,
  'delete a page': `${host}/v1/pages/{id}`,
  'get page by ID': `${host}/v1/pages/{id}`,


  'get exercises': `${host}/v1/exercises?lesson_id={id}`,
  'post an exercise': `${host}/v1/exercises`,
  'put an exercise': `${host}/v1/exercises`,
  'delete an exercise': `${host}/v1/exercises/{id}`,
  'get exercise by ID': `${host}/v1/exercises/{id}`,

  'get lessons': `${host}/v1/lessons`,
  'post a lesson': `${host}/v1/lessons`,
  'put a lesson': `${host}/v1/lessons`,
  'delete a lesson': `${host}/v1/lessons/{id}`,
  'get lesson by ID': `${host}/v1/lessons/{id}`
};
