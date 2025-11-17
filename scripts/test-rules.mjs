import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'

const projectId = 'splitwise-clone-test'

async function run() {
  // load rules
  const rules = readFileSync('./firestore.rules', 'utf8')

  // If FIRESTORE_EMULATOR_HOST/PORT are set, pass them through. Otherwise initializeTestEnvironment
  // will attempt to talk to the emulator if available. If not, provide a clear instruction.
  const host = process.env.FIRESTORE_EMULATOR_HOST
  const port = process.env.FIRESTORE_EMULATOR_PORT

  let testEnv
  try {
    if (host && port) {
      testEnv = await initializeTestEnvironment({
        projectId,
        firestore: { host, port: Number(port), rules }
      })
    } else {
      testEnv = await initializeTestEnvironment({
        projectId,
        firestore: { rules }
      })
    }
  } catch (err) {
    console.error('\nFailed to initialize the test environment for Firestore rules.')
    console.error('The rules unit test runner requires the Firestore emulator to be available.')
    console.error('Run the tests with the emulator started using:')
    console.error("  firebase emulators:exec 'npm run test-rules'")
    console.error("or start the emulator in another terminal: 'firebase emulators:start --only firestore'\n")
    console.error('Original error:')
    console.error(err)
    process.exit(1)
  }

  // Create two authenticated contexts
  const alice = testEnv.authenticatedContext('alice-uid', { email: 'alice@example.com' })
  const bob = testEnv.authenticatedContext('bob-uid', { email: 'bob@example.com' })

  // Admin context for setup
  const admin = testEnv.unauthenticatedContext()

  // Write a group document as admin (simulating created group)
  const gRef = admin.firestore().collection('groups').doc('g1')
  await gRef.set({ name: 'Test Group', members: ['alice-uid'], owner: 'alice-uid' })

  // Alice (member) should be able to read group
  await assertSucceeds(alice.firestore().collection('groups').doc('g1').get())

  // Bob (not a member) should NOT be able to read
  await assertFails(bob.firestore().collection('groups').doc('g1').get())

  // Alice should be able to create an expense in group g1
  const expense = { payer: 'alice-uid', amount: 100 }
  await assertSucceeds(alice.firestore().collection('groups').doc('g1').collection('expenses').add(expense))

  // Bob should not be able to create expense in g1
  await assertFails(bob.firestore().collection('groups').doc('g1').collection('expenses').add(expense))

  console.log('All rule checks passed')
  await testEnv.cleanup()
}

run().catch((err) => {
  console.error('Rule checks failed:', err)
  process.exitCode = 1
})
