//const Issue = require('./issue');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../error');
const ObjectID = require('mongodb').ObjectID;

var myDb;
const myConn = async (myDataBase) => {
  return myDb = await myDataBase
}

const getIssues = async (req, res) => {

  myConn

  //console.log(req.query.assigned_to)

  if(req.query.open == "true") {
    req.query.open = true
  } else if(req.query.open == "false"){
    req.query.open = false
  }

  req.query.project = req.params.project;

  const issues = await myDb.find({ ...req.query }).toArray();

  //console.log(issues)

  if (!issues) {
    throw new NotFoundError(`No project called ${req.params.project} found`);
  }

  var resp = issues.map((d) => ({
    _id: d._id,
    issue_title: d.issue_title,
    issue_text: d.issue_text,
    created_on: d.createdAt,
    updated_on: d.updatedAt,
    created_by: d.created_by,
    assigned_to: d.assigned_to,
    open: d.open,
    status_text: d.status_text
  }));

  res.status(StatusCodes.OK).json(resp);
}

const createIssue = async (req, res) => {
  myConn

  req.body.project = req.params.project;
  const { body: { issue_title, issue_text, created_by } } = req;

  if (!issue_title || !issue_text || !created_by) {
    res.json({ error: 'required field(s) missing' });
    return;
  }

  const doc = {
    _id: new ObjectID(),
    issue_title: req.body.issue_title,
    issue_text: req.body.issue_text,
    created_by: req.body.created_by,
    assigned_to: req.body.assigned_to,
    status_text: req.body.status_text,
    project: req.body.project,
    open: true
  }
  //console.log('doc', doc)

  const result = await myDb.insertOne(doc);
  //console.log(`A document was inserted with the _id: ${result.insertedId}`);
  res.status(StatusCodes.CREATED).json(doc);

}

const updateIssue = async (req, res) => {
  req.body.project = req.params.project;
  const {
    body: {
      _id: id,
      issue_title: i_ti,
      issue_text: i_te,
      created_by: c_by,
      assigned_to: a_to,
      status_text: s_te,
      open: o
    }
  } = req;

  const body = {
    _id: new ObjectID(id),
    issue_title: i_ti,
    issue_text: i_te,
    created_by: c_by,
    assigned_to: a_to,
    status_text: s_te,
    open: o
  }

  if (!id) {
    res.json({ error: 'missing _id' });
    return;
  }

  if (!i_ti && !i_te && !c_by && !a_to && !s_te && !o) {
    res.json({ error: 'no update field(s) sent', _id: id })
    return;
  }

  Object.assign(body, { project: req.body.project });

  //console.log('req open', typeof(req.body.open))
  //console.log('req open', req.body.open)
  if (req.body.open == "true" || req.body.open == true || req.body.open == undefined) {
    Object.assign(body, { open: true });
  } else if (req.body.open == "false" || req.body.open == false ) {
    Object.assign(body, { open: false });
  }

  var cleanBody = Object.keys(body)
    .filter((k) => body[k] !== '')
    .reduce((a, k) => ({ ...a, [k]: body[k] }), {});

  //console.log('cleanBody', cleanBody._id)

  myConn

  const result = await myDb.updateOne(
    { _id: cleanBody._id },
    { $set: cleanBody }
    /**,
    (err, doc) => {
      console.log('err >', err)
      console.log('doc >', doc)
    }*/
  );

  //console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  //console.log(`${result.modifiedCount} document(s) was/were updated.`);

  if(!result){
    res.json({error: 'could not update', _id: id});
    return;
  }

  res.json({result: 'successfully updated', _id: id});

}

const deleteIssue = async (req, res) => {
  const id = new ObjectID(req.body._id);

  if (!id) {
    res.json({ error: 'missing _id' });
    return;
  }

  myConn

  const issue = await myDb.deleteOne({ _id: id });

  if (!issue) {
    res.json({ error: 'could not delete', _id: id });
    return;
  }
  res.json({ result: 'successfully deleted', _id: id });
}

module.exports = {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  myConn
}