const d = require('./data/internships');
d.SAMPLE_INTERNSHIPS.forEach((i, idx) => {
  if (!i.company_name) console.log(idx, i.title, i.company_name);
});
