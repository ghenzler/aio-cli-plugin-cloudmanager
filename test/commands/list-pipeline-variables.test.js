/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { cli } = require('cli-ux')
const { setStore } = require('@adobe/aio-lib-core-config')
const ListPipelineVariablesCommand = require('../../src/commands/cloudmanager/list-pipeline-variables')

beforeEach(() => {
    setStore({})
})

test('list-pipeline-variables - missing arg', async () => {
    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run([])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toSatisfy(err => err.message.indexOf("Missing 1 required arg") > -1)
})

test('list-pipeline-variables - missing programId', async () => {
    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run(["1"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toSatisfy(err => err.message.indexOf("Program ID must be specified either as --programId flag or through cloudmanager_programid") === 0)
})

test('list-pipeline-variables - missing config', async () => {
    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run(["1", "--programId", "5"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('missing config data: jwt-auth'))
})

test('list-pipeline-variables - pipelines not found', async () => {
    setStore({
        'jwt-auth': JSON.stringify({
            client_id: '1234',
            jwt_payload: {
                iss: "good"
            }
        }),
        'cloudmanager_programid': "6"
    })

    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run(["1"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('Cannot retrieve pipelines: https://cloudmanager.adobe.io/api/program/6/pipelines (404 Not Found)'))
})

test('list-pipeline-variables - no pipeline', async () => {
    setStore({
        'jwt-auth': JSON.stringify({
            client_id: '1234',
            jwt_payload: {
                iss: "good"
            }
        }),
        'cloudmanager_programid': "4"
    })

    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run(["4"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('Could not find pipeline 4 for program 4'))
})

test('list-pipeline-variables - no variables link', async () => {
    setStore({
        'jwt-auth': JSON.stringify({
            client_id: '1234',
            jwt_payload: {
                iss: "good"
            }
        }),
        'cloudmanager_programid': "5"
    })

    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run(["6"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('Could not find variables link for pipeline 6 for program 5'))
})

test('list-pipeline-variables - link returns 404', async () => {
    setStore({
        'jwt-auth': JSON.stringify({
            client_id: '1234',
            jwt_payload: {
                iss: "good"
            }
        }),
        'cloudmanager_programid': "5"
    })

    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run(["7"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).rejects.toEqual(new Error('Cannot get variables: https://cloudmanager.adobe.io/api/program/5/pipeline/7/variables (404 Not Found)'))
})

test('list-pipeline-variables - success empty', async () => {
    setStore({
        'jwt-auth': JSON.stringify({
            client_id: '1234',
            jwt_payload: {
                iss: "good"
            }
        }),
        'cloudmanager_programid': "5"
    })

    expect.assertions(2)

    let runResult = ListPipelineVariablesCommand.run(["8"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toEqual([])
})

test('list-pipeline-variables - success', async () => {
    setStore({
        'jwt-auth': JSON.stringify({
            client_id: '1234',
            jwt_payload: {
                iss: "good"
            }
        }),
        'cloudmanager_programid': "5"
    })

    expect.assertions(3)

    let runResult = ListPipelineVariablesCommand.run(["5"])
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(runResult).resolves.toMatchObject([{
        "name" : "KEY",
        "type": "string",
        "value" : "value"
    },{
        "name" : "I_AM_A_SECRET",
        "type": "secretString"
    }])
    await expect(cli.table.mock.calls[0][1].value.get({
        "name" : "I_AM_A_SECRET",
        "type": "secretString"
    })).toBe("****")
})
