import { ConsoleColors } from './constants'

export default class Logger {
    public static initialProgress = 0

    public static progress = 0

    public static startTime = new Date().getTime()

    /**
     * Updates the progress of the logger.
     * This method calculates the progress bar, updates the console output, and displays the estimated remaining time.
     */
    private static updateProgress() {
        const progressBarWidth = 30
        const filledWidth = Math.round(progressBarWidth * (Logger.progress / 100))
        const emptyWidth = progressBarWidth - filledWidth
        const progressBar = '█'.repeat(filledWidth) + ' '.repeat(emptyWidth)

        console.clear()
        console.log(`Progress: [${Logger.colorMessage(progressBar, ConsoleColors.FgGreen)}] ${Logger.progress}%`)
        const currentTime = new Date().getTime()
        const elapsedTime = Math.round((currentTime - Logger.startTime) / 1000)
        const estimatedTotalTime = (elapsedTime * 100 / (Logger.progress - Logger.initialProgress)) || 0
        const remainingTime = Math.max(estimatedTotalTime - elapsedTime, 0)
        console.log(`Estimated remaining time: ${Logger.formatTime(remainingTime)}`)
    }

    /**
     * Formats the given time in seconds into a string representation of hours, minutes, and seconds.
     * @param seconds - The time in seconds to format.
     * @returns A string representation of the formatted time in the format "HH:MM:SS".
     */
    static formatTime(seconds: number) {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const formattedHours = hours.toString().padStart(2, '0')
        const formattedMinutes = minutes.toString().padStart(2, '0')
        const formattedSeconds = Math.floor(seconds % 60).toString().padStart(2, '0')
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    }

    /**
     * Updates the progress at regular intervals until it reaches 100%.
     */
    static Progress() {
        const updateInterval = 1000 // Update interval in milliseconds
        const intervalId = setInterval(() => {
            Logger.updateProgress()

            if (Logger.progress >= 100) {
                clearInterval(intervalId)
                console.log('Progress complete!')
            }
        }, updateInterval)
    }

    /**
     * Formats a message with a specified color.
     * 
     * @param message - The message to be formatted.
     * @param color - The color to apply to the message.
     * @returns The formatted message with the specified color.
     */
    static colorMessage(message: string, color: ConsoleColors) {
        return `${color}${message}${ConsoleColors.Reset}`
    }

    /**
     * Registers a callback function to be executed before the process exits.
     * @param method - The callback function to be executed.
     */
    static logBeforeExit(method: () => void) {
        const stats = () => {
            console.clear()
            method()
            process.exit(0)
        }
        process.on('beforeExit', stats)
        process.on('SIGINT', stats)

    }
}