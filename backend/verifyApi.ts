import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function runTests() {
  try {
    console.log('Registering user...');
    const rand = Math.random().toString(36).substring(7);
    const registerRes = await axios.post(`${API_URL}/register`, {
      username: `testuser_${rand}`,
      email: `test_${rand}@example.com`,
      password: 'password123'
    });
    const token = registerRes.data.token;
    console.log('User registered. Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('Creating a task...');
    const createRes = await axios.post(`${API_URL}/tasks`, {
      title: 'First Task',
      description: 'This is my first task',
      priority: 'high',
      xp_reward: 100
    }, { headers });
    
    const taskId = createRes.data.id;
    console.log('Task created with ID:', taskId);

    console.log('Fetching tasks...');
    const getRes = await axios.get(`${API_URL}/tasks`, { headers });
    console.log('Tasks fetched:', getRes.data.length);

    console.log('Updating task...');
    await axios.put(`${API_URL}/tasks/${taskId}`, {
      title: 'First Task Updated',
      description: 'Updated description',
      priority: 'low',
      xp_reward: 50,
      status: 'todo',
      due_date: new Date().toISOString()
    }, { headers });
    console.log('Task updated.');

    console.log('Patching task status...');
    await axios.patch(`${API_URL}/tasks/${taskId}/status`, {
      status: 'in-progress'
    }, { headers });
    console.log('Task status updated.');

    console.log('Deleting task...');
    await axios.delete(`${API_URL}/tasks/${taskId}`, { headers });
    console.log('Task deleted.');

    console.log('All API tests passed successfully!');
  } catch (err: any) {
    console.error('API test failed:', err.response?.data || err.message);
  }
}

runTests();
