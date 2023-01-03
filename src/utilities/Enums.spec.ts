import {
    KeyPowerStatus, DataGramDirection,
    LEDBackgroundBrightness, LockStatus,
} from './Enums'

describe('Enums', () => {
    it('KeyPowerStatus', () => {
        expect(KeyPowerStatus.ON).toBe(0x4F)
        expect(KeyPowerStatus.OFF).toBe(0x46)
        expect(KeyPowerStatus.LONG).toBe(0x4C)
        expect(KeyPowerStatus.SHORT).toBe(0x53)
    })

    it('LEDBackgroundBrightness', () => {
        expect(LEDBackgroundBrightness.OFF).toBe(0)
        expect(LEDBackgroundBrightness.LOW).toBe(1)
        expect(LEDBackgroundBrightness.HIGH).toBe(2)
        expect(LEDBackgroundBrightness.MAX).toBe(3)
    })

    it('LockStatus', () => {
        expect(LockStatus.UNLOCKED).toBe(0)
        expect(LockStatus.LOCKED).toBe(1)
    })

    it('DataGramDirection', () => {
        expect(DataGramDirection.OUTGOING).toBe(0x3E)
        expect(DataGramDirection.INCOMING).toBe(0x3C)
    })
})
