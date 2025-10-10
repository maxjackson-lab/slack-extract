"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkProcessor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const logger = require('../utils/logger');
/**
 * Service for processing CSV files and chunking data for analysis
 */
class ChunkProcessor {
    constructor() {
        this.EXPORTS_DIR = path.join(process.cwd(), 'exports');
    }
    /**
     * Find the latest CSV file in the exports directory
     */
    findLatestCsvFile() {
        try {
            const files = fs.readdirSync(this.EXPORTS_DIR);
            const csvFiles = files.filter(file => file.endsWith('.csv'));
            if (csvFiles.length === 0) {
                logger.warn(`No CSV files found in ${this.EXPORTS_DIR}`);
                return null;
            }
            // Sort by modification time (latest first)
            csvFiles.sort((a, b) => {
                const statA = fs.statSync(path.join(this.EXPORTS_DIR, a));
                const statB = fs.statSync(path.join(this.EXPORTS_DIR, b));
                return statB.mtime.getTime() - statA.mtime.getTime();
            });
            const latestFile = path.join(this.EXPORTS_DIR, csvFiles[0]);
            logger.info(`Found latest CSV file: ${latestFile}`);
            return latestFile;
        }
        catch (error) {
            logger.logError(error, { operation: 'findLatestCsvFile' });
            return null;
        }
    }
    /**
     * Process a CSV file and return an array of SlackMessage objects
     */
    async processCsvFile(filePath, chunkSize) {
        logger.info(`Processing CSV file: ${filePath}`);
        const messages = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => {
                messages.push({
                    channel: data.Channel,
                    message: data.Message,
                    user: data.User,
                    timestamp: data.Timestamp,
                    threadParent: data.Thread_Parent || undefined,
                    urls: data.URLs || undefined,
                    slackUrl: data.Slack_URL || undefined,
                    isThreadReply: data.Is_Thread_Reply === 'Yes',
                    messageType: data.Message_Type,
                    hasAttachments: data.Has_Attachments === 'Yes',
                    hasFiles: data.Has_Files === 'Yes',
                });
            })
                .on('end', () => {
                logger.info(`Successfully parsed ${messages.length} messages from CSV`);
                const chunks = this.chunkMessages(messages, chunkSize);
                logger.info(`Successfully created ${chunks.length} chunks for analysis`);
                resolve(chunks);
            })
                .on('error', (error) => {
                logger.logError(error, { operation: 'processCsvFile' });
                reject(error);
            });
        });
    }
    /**
     * Chunk messages into smaller pieces for GPT analysis
     */
    chunkMessages(messages, chunkSize) {
        const chunks = [];
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunkMessages = messages.slice(i, i + chunkSize);
            // Simple token count estimation (can be improved)
            const tokenCount = chunkMessages.reduce((sum, msg) => sum + (msg.message?.length || 0) / 4, 0);
            chunks.push({
                chunkIndex: Math.floor(i / chunkSize) + 1,
                totalChunks: Math.ceil(messages.length / chunkSize),
                messages: chunkMessages,
                tokenCount: Math.round(tokenCount)
            });
        }
        logger.info(`Chunking ${messages.length} messages into ${chunks.length} chunks of ${chunkSize} messages each`);
        return chunks;
    }
    /**
     * Get statistics about the chunks
     */
    getChunkStats(chunks) {
        const totalMessages = chunks.reduce((sum, chunk) => sum + chunk.messages.length, 0);
        const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
        const averageTokensPerChunk = chunks.length > 0 ? Math.round(totalTokens / chunks.length) : 0;
        const maxTokensInChunk = Math.max(...chunks.map(c => c.tokenCount));
        const minTokensInChunk = Math.min(...chunks.map(c => c.tokenCount));
        return {
            totalChunks: chunks.length,
            totalMessages,
            averageTokensPerChunk,
            maxTokensInChunk,
            minTokensInChunk
        };
    }
}
exports.ChunkProcessor = ChunkProcessor;
//# sourceMappingURL=chunkProcessor.js.map