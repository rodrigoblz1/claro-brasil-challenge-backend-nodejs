const assert = require('assert');
const should = require('should');

const {DeviceJoiSchema, DeviceModel} = require('../models/Device');
const UserModel = require('../models/User');

const request = require('supertest');
const express = require('express');

const {app} = require('../app');

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

  it('User 123 edits a device name by id after getting the device list', async () => {
    let userId = '123';
    let newDeviceName = 'iPhone Novo';

    let response1 = await request(app)
    .get('/users/' + userId + '/devices/').expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    let device = response1.body[0];
    let response2 = await request(app)
    .put('/devices/' + device._id + '/' + newDeviceName).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    let deviceRes = response2.body.device;
    deviceRes.name.should.eql(newDeviceName);

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

    let device1 = response.body[0];
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

  it('User 456 gets list of devices and removes 2 more', async () => {
    let userId = '456';

    let response = await request(app)
    .get('/users/' + userId + '/devices/').expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    await request(app)
    .delete('/devices/' + response.body[0]._id).expect('Content-Type', /json/)
    .expect(200)
    .catch(err => {
      console.log(err);
    })

    await request(app)
    .delete('/devices/' + response.body[1]._id).expect('Content-Type', /json/)
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

    let device1 = response.body.pop();
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

})