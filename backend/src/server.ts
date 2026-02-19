import Fastify from 'fastify';
import { Server } from 'socket.io';
import { GameState } from './gameState';
import { processTurn } from './turnProcessor';
import { MoveIntent } from './types';

const fastify = Fastify({ logger: true });

// Global state for prototype
let game: GameState;
let connectedPlayers: string[] = [];
let turnIntents: MoveIntent[] = [];
let readyPlayers: Set<string> = new Set();

const start = async () => {
    try {
        await fastify.ready();

        const io = new Server(fastify.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        game = new GameState();

        io.on('connection', (socket) => {
            console.log('Player connected:', socket.id);

            // Assign Role: p1, p2, p3...
            const role = `p${connectedPlayers.length + 1}`;
            connectedPlayers.push(socket.id);

            socket.emit('welcome', {
                role: role,
                map: game.map,
                units: game.units,
                players: Array.from(game.players.values())
            });

            socket.on('disconnect', () => {
                console.log('Player disconnected:', socket.id);
                // In a real game, handle reconnection logic.
                // For now, just remove them from tracking (but role remains taken).
                connectedPlayers = connectedPlayers.filter(id => id !== socket.id);
                readyPlayers.delete(role);
            });

            socket.on('submit_intent', (data: { unit_id: string, target: {x: number, y: number} }) => {
                // Check if unit exists
                const unit = game.units.find(u => u.id === data.unit_id);
                if (unit && unit.owner_id === role) {
                     // Overwrite previous intent for this unit
                     turnIntents = turnIntents.filter(i => i.unit_id !== data.unit_id);

                     turnIntents.push({
                         unit_id: data.unit_id,
                         target: data.target,
                         path_cost: 0
                     });

                     socket.emit('intent_ack', { unit_id: data.unit_id, status: 'received' });
                }
            });

            socket.on('commit_turn', () => {
                readyPlayers.add(role);
                io.emit('player_ready', { role: role });

                const activePlayerCount = connectedPlayers.length;
                if (activePlayerCount > 0 && readyPlayers.size >= activePlayerCount) {
                    console.log("All players ready! Processing turn...");

                    // Process Turn
                    const newUnits = processTurn(game.units, turnIntents, game.map);
                    game.units = newUnits;

                    // Reset for next turn
                    turnIntents = [];
                    readyPlayers.clear();
                    game.turn++;

                    // Broadcast new state
                    io.emit('turn_processed', {
                        turn: game.turn,
                        units: game.units
                    });
                }
            });
        });

        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server listening on http://0.0.0.0:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
