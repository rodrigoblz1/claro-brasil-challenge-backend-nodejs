const assert = require('assert');
const should = require('should');

const {DeviceJoiSchema, DeviceModel} = require('../models/Device');
const UserModel = require('../models/User');

const request = require('supertest');
const express = require('express');

const app = require('../app');

describe('Testing devices routes', () => {
  it('User 123 requests your first device registration', async () => {
    let device = {
      userId: '123',
      name: 'iPhone Véi',
      model: 'iOS'
    }
    let response = await request(app).post('/devices/').send(device).expect('Content-Type', /json/)
    .expect(200);

    let deviceRes = response.body.device;
    // Check its id
    deviceRes.should.have.property('_id');
    // Check the other properties
    deviceRes.name.should.eql(device.name);
    deviceRes.model.should.eql(device.model.toUpperCase()); // This one must be uppercased
    deviceRes.userId.should.eql(device.userId);
  });

  it('User 123 fails to register new device with an invalid body', async () => {
    // Missing 'model' and 'name', 'names' not allowed
    let device = {
      userId: '123',
      names: 'iPhone Véi'
    }
    let response = await request(app).post('/devices/').send(device).expect('Content-Type', /json/)
    .expect(400);
  });

  it('User 123 edits a device name by id after getting the device list', async () => {
    let userId = '123';
    let newDeviceName = 'iPhone Novo';

    let response1 = await request(app)
    .get('/users/' + userId + '/devices/').expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    let device = response1.body.devices[0];
    let response2 = await request(app)
    .put('/devices/' + device._id + '/' + newDeviceName).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    let deviceRes = response2.body.device;
    deviceRes.name.should.eql(newDeviceName);

  });

  it('User 123 fails to edit device with an invalid id', async () => {
    let userId = '123';
    let newDeviceName = 'iPhone Mais Novo Ainda';

    await request(app)
    .put('/devices/' + '1oi2joads8d0' + '/' + newDeviceName).expect('Content-Type', /json/)
    .expect(400)
    .catch(err => {
      console.log(err);
    })

    // The second one uses an valid id, but not stored in the database, giving another error
    let newDevice = new DeviceModel({
      userId: '123',
      name: 'iPhone Véi',
      model: 'iOS'
    });

    await request(app)
    .put('/devices/' + newDevice._id + '/' + newDeviceName).expect('Content-Type', /json/)
    .expect(400)
    .catch(err => {
      console.log(err);
    })
  });

  it('User 456 register 3 devices', async () => {
    let userId = '456';

    let date = new Date();
    let device1 = {
      userId: userId,
      name: 'Android 1',
      model: 'Android',
      date_added: date
    };

    let device2 = {
      userId: userId,
      name: 'Android 2',
      model: 'Android',
      date_added: date
    };

    let device3 = {
      userId: userId,
      name: 'iPhone 1',
      model: 'ios',
      date_added: date
    };

    // Make the requests
    await request(app)
    .post('/devices/').send(device1).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    await request(app).post('/devices/').send(device2).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    await request(app).post('/devices/').send(device3).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    // Get all stored devices for user 456
    let userDevices = await DeviceModel.find({userId: userId});
    // It should have 3 atm
    userDevices.length.should.eql(3);
   
    // Gets the user and check total and current amount of devices
    let user = await UserModel.findOne({id:userId});
    should(user.total_devices_registered).eql(3);
    should(user.current_devices_amount).eql(3);
  });

  it('User 456 tries to register a fourth device and but it fails', async () => {
    let userId = '456';
    let device1 = {
      userId: userId,
      name: 'Android 2',
      model: 'Android',
      date_added: new Date()
    };

    await request(app)
    .post('/devices/').send(device1).expect('Content-Type', /json/)
    .expect(400)
    .catch(err => {
      console.log(err);
    })
  });

  it('User 456 gets list of devices then remove one', async () => {
    let userId = '456';

    let response = await request(app)
    .get('/users/' + userId + '/devices/').expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    let device1 = response.body.devices[0];
    await request(app)
    .delete('/devices/' + device1._id).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    // Gets the user and check total and current amount of devices
    let user = await UserModel.findOne({id:userId});
    should(user.total_devices_registered).eql(3);
    should(user.current_devices_amount).eql(2);
  });

  it('User 456 now registers a new device (completing an exchange)', async () => {
    let userId = '456';
    let deviceNew = {
      userId: userId,
      name: 'Android Novo',
      model: 'Android',
      date_added: new Date()
    };

    await request(app)
    .post('/devices/').send(deviceNew).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })
  });

  it('User 456 tries to register a new device with maximum reached and exchange available', async () => {
    let userId = '456';
    let device = {
      userId: userId,
      name: 'iPhone Véi',
      model: 'iOS'
    }
    let response = await request(app).post('/devices/').send(device).expect('Content-Type', /json/)
    .expect(400);
  });

  it('User 456 gets list of devices and removes 2 more', async () => {
    let userId = '456';

    let response = await request(app)
    .get('/users/' + userId + '/devices/').expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    await request(app)
    .delete('/devices/' + response.body.devices[0]._id).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    await request(app)
    .delete('/devices/' + response.body.devices[1]._id).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })
  });

  it('User 456 retrieves last device and tries to remove but it fails because a new register cannot be made atm', async () => {
    let userId = '456';

    let response = await request(app)
    .get('/users/' + userId + '/devices/').expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    let device1 = response.body.devices.pop();
    await request(app)
    .delete('/devices/' + device1._id).expect('Content-Type', /json/)
    .expect(400)
    .catch(err => {
      console.log(err);
    })

    // Gets the user and check total and current amount of devices
    let user = await UserModel.findOne({id:userId});
    should(user.total_devices_registered).eql(4);
    should(user.current_devices_amount).eql(1);
  });

  it('User 456 tries to register a new device but fails (exchange delay)', async () => {
    let userId = '456';
    let device = {
      userId: userId,
      name: 'iPhone Véi',
      model: 'iOS'
    }
    let response = await request(app).post('/devices/').send(device).expect('Content-Type', /json/)
    .expect(400);
  });

  it('Tries to get devices of invalid user', async () => {
    await request(app)
    .get('/users/' + 'abc' + '/devices/').expect('Content-Type', /json/)
    .expect(400)
    .catch(err => {
      console.log(err);
    })
  });

  it('Tries to remove device with invalid id', async() => {
    // The first one uses an invalid id, generating a database error
    let deviceId = '000';
    await request(app)
    .delete('/devices/' + deviceId).expect('Content-Type', /json/)
    .expect(503)
    .catch(err => {
      console.log(err);
    })

    // The second one uses an valid id, but not stored in the database, giving another error
    let newDevice = new DeviceModel({
      userId: '123',
      name: 'iPhone Véi',
      model: 'iOS'
    });

    await request(app)
    .delete('/devices/' + newDevice._id).expect('Content-Type', /json/)
    .expect(400)
    .catch(err => {
      console.log(err);
    })
  });

})