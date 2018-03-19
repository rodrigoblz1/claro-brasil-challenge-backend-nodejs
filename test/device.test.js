const assert = require('assert');
const should = require('should');

const {DeviceJoiSchema, DeviceModel} = require('../models/Device');


describe('Saving devices', () => {
  it('Saves a device to the database', async () => {
    let newDevice = {
      user_id: '123',
      name: 'iPhone de Rodrigo',
      model: 'iOS',
      date_added: new Date()
    };
    let joiDevice = await DeviceJoiSchema.validate(newDevice);
    let device = new DeviceModel(joiDevice);

    // Saves the device
    await device.save();
    // Get all stored devices
    let devices = await DeviceModel.find();
    // It should have 1 atm
    devices.length.should.eql(1);
    // Check its id
    devices[0].should.have.property('_id');
    // Check the other properties
    devices[0].name.should.eql('iPhone de Rodrigo')
    // Check if model is uppercased
    devices[0].model.should.eql('IOS')
  })
})