import { MapData, Unit, PlayerState, MoveIntent } from './types';
import { INITIAL_MAP, INITIAL_UNITS } from './initialData';

export class GameState {
    public map: MapData;
    public units: Unit[];
    public players: Map<string, PlayerState>;
    public turn: number;

    constructor() {
        this.map = INITIAL_MAP;
        this.units = [...INITIAL_UNITS];
        this.players = new Map();
        this.turn = 1;
    }

    public addPlayer(socketId: string): PlayerState {
        // Simple color cycle
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00];
        const color = colors[this.players.size % colors.length];

        // Assign logical player ID (p1, p2, etc) based on order?
        // For simplicity, map socketId to p1/p2/p3 if they reconnect, or new ones.
        // Let's just use socketId as owner_id for new units, but re-map initial units for testing.
        // Hack: Map 1st player to 'p1', 2nd to 'p2' to control initial units.

        let playerId = `p${this.players.size + 1}`;

        const player: PlayerState = {
            id: playerId,
            color: color,
            ready: false,
            intents: []
        };

        this.players.set(socketId, player);
        return player;
    }

    public removePlayer(socketId: string) {
        this.players.delete(socketId);
    }

    public getPlayer(socketId: string): PlayerState | undefined {
        return this.players.get(socketId);
    }

    public submitIntent(socketId: string, intent: MoveIntent): boolean {
        const player = this.players.get(socketId);
        if (!player) return false;

        // Validate unit ownership
        const unit = this.units.find(u => u.id === intent.unit_id);
        if (!unit || unit.owner_id !== player.id) return false;

        // Overwrite existing intent for this unit if any
        player.intents = player.intents.filter(i => i.unit_id !== intent.unit_id);
        player.intents.push(intent);

        return true;
    }

    public toggleReady(socketId: string): boolean {
        const player = this.players.get(socketId);
        if (!player) return false;
        player.ready = !player.ready;
        return player.ready;
    }

    public allPlayersReady(): boolean {
        if (this.players.size === 0) return false;
        return Array.from(this.players.values()).every(p => p.ready);
    }

    public resetReadiness() {
        this.players.forEach(p => p.ready = false);
    }
}
