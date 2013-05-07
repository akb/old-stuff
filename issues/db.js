module.exports = {
  users: [
    { name:'bob' },
    { name:'jane' }
  ],

  states: [
    { name:'requested' },
    { name:'started' },
    { name:'finished' },
    { name:'accepted' },
    { name:'request' }
  ],

  issues: [{
    title: 'thing bug',
    description: "the thing doesn't work",
    state: 'requested',
    category: 'bugs',
    requester_id: 1,
    developer_id: 0
  }, {
    title: 'hoopajoob bug',
    description: "hoopajoob is broken",
    state: 'requested',
    category: 'bugs',
    requester_id: 1,
    developer_id: 0
  }]
}; 
