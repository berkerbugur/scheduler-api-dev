const { Router } = require('express');
const router = Router();
const express = require('express')
const { validateScheduleCreate, validateScheduleExtend } = require('../validations/schedule-validations')
const {transformSchedule} = require("../transformer/transformSchedule");

router.use(express.json())

router.post('/api/v1/schedule/create', async (req, res) => {
  try {
    const validation = validateScheduleCreate(req.body)
    
    if (!validation.success) {
      return res.status(400).json({
        validationErrors: validation.errors,
        data: null
      })
    }

    return res.status(201).json({
      validationErrors: [],
      data: {
        success: true,
        message: 'Schedule successfully created.'
      }
    })

  } catch (error) {
    console.error('Error creating schedule:', error)
    return res.status(500).json({
      validationErrors: [{
        path: 'server',
        message: 'Internal server error occurred'
      }],
      data: null
    })
  }
})

router.put('/api/v1/schedule/extend', async (req, res) => {
  console.log(req.body)

  try {
    const validation = validateScheduleExtend(req.body)

    if (!validation.success) {
      return res.status(400).json({
        validationErrors: validation.errors,
        data: null
      })
    }

    return res.status(200).json({
      validationErrors: [],
      data: transformSchedule(validation.data)
    })

  } catch (error) {
    console.error('Error extending schedule:', error)
    return res.status(500).json({
      validationErrors: [{
        path: 'server',
        message: 'Internal server error occurred'
      }],
      data: null
    })
  }
})

module.exports = { router };