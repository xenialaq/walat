let host = '';

$.fn.api.settings.api = {
  'get assets': `${host}/v1/assets`,
  'post an asset': `${host}/v1/assets`,
  'put an asset': `${host}/v1/assets`,
  'delete an asset': `${host}/v1/assets/{id}`,
  'get asset by ID': `${host}/v1/assets/{id}`,

  'get questions': `${host}/v1/questions?exercise_id={id}`,
  'post a question': `${host}/v1/questions`,
  'put a question': `${host}/v1/questions`,
  'delete a question': `${host}/v1/questions/{id}`,
  'get question by ID': `${host}/v1/questions/{id}`,


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
