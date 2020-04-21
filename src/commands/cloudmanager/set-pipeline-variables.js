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

const BasePipelineVariablesCommand = require('../../base-pipeline-variables-command')
const BaseVariablesCommand = require('../../base-variables-command')
const { accessToken: getAccessToken } = require('@adobe/aio-cli-plugin-jwt-auth')
const { getApiKey, getOrgId } = require('../../cloudmanager-helpers')
const Client = require('../../client')
const commonFlags = require('../../common-flags')

async function _setPipelineVariables(programId, pipelineId, variables, passphrase) {
    const apiKey = await getApiKey()
    const accessToken = await getAccessToken(passphrase)
    const orgId = await getOrgId()
    return new Client(orgId, accessToken, apiKey).setPipelineVariables(programId, pipelineId, variables)
}

class SetPipelineVariablesCommand extends BasePipelineVariablesCommand {
    async run() {
        const { args, flags } = this.parse(SetPipelineVariablesCommand)

        return this.runSet(args, flags)
    }

    async setVariables(programId, args, variables, passphrase = null) {
        return _setPipelineVariables(programId, args.pipelineId, variables, passphrase)
    }
}

SetPipelineVariablesCommand.description = 'sets variables set on a pipeline'

SetPipelineVariablesCommand.args = [
    {name: 'pipelineId', required: true, description: "the pipeline id"}
]

SetPipelineVariablesCommand.flags = {
    ...commonFlags.global,
    ...commonFlags.programId,
    ...BaseVariablesCommand.flags
}

module.exports = SetPipelineVariablesCommand
