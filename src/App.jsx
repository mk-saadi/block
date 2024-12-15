import { Fade } from "react-awesome-reveal";
import React, { useState, useRef, useCallback, useEffect } from "react";

const Block = ({ block, onAddChild, onRemoveBlock, onUpdatePosition, parentPosition }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [position, setPosition] = useState(block.position);
	const blockRef = useRef(null);

	const handleMouseDown = (e) => {
		setIsDragging(true);
		const startX = e.clientX - position.x;
		const startY = e.clientY - position.y;

		const handleMouseMove = (e) => {
			const newX = e.clientX - startX;
			const newY = e.clientY - startY;
			const newPosition = { x: newX, y: newY };

			setPosition(newPosition);
			onUpdatePosition(block.id, newPosition);
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<>
			<div
				ref={blockRef}
				className={`absolute overflow-hidden z-50 shadow-lg shadow-black/40 w-24 h-fit bg-purple-100 border-2 border-purple-300 rounded-sm p-1 ${
					isDragging ? "cursor-grabbing" : "cursor-grab"
				}`}
				style={{
					left: `${position.x}px`,
					top: `${position.y}px`,
				}}
				onMouseDown={handleMouseDown}
			>
				<Fade>
					<div className="flex flex-col items-center justify-between w-full">
						<span className="text-lg font-semibold pointer-events-none select-none">
							{block.id}
						</span>
						<div className="flex flex-col w-full gap-y-1">
							<button
								onClick={() => onAddChild(block.id)}
								className="flex items-center justify-center w-full py-0.5 text-xl text-black bg-purple-500 rounded-sm select-none focus:outline-0"
							>
								+
							</button>
							{block.id !== 1 && (
								<button
									onClick={() => onRemoveBlock(block.id)}
									className="flex items-center justify-center w-full py-0.5 text-xl text-black bg-red-500 rounded-sm select-none focus:outline-0"
								>
									-
								</button>
							)}
						</div>
					</div>
				</Fade>
			</div>
			{parentPosition && (
				<svg
					className="absolute z-10 pointer-events-none"
					style={{
						width: "100%",
						height: "100%",
						top: 0,
						left: 0,
					}}
				>
					<path
						d={`
							M${parentPosition.x + 50},${parentPosition.y + 50}
							V${Math.max(parentPosition.y, position.y) + 130}
							H${position.x + 50}
							V${position.y + 50}
            			  `}
						fill="none"
						stroke="rgba(0,0,0,0.4)"
						strokeDasharray="5,5"
					/>
				</svg>
			)}
		</>
	);
};

const App = () => {
	const [blocks, setBlocks] = useState([]);
	const [blockPositions, setBlockPositions] = useState({});
	const [blockParents, setBlockParents] = useState({});
	const [nextBlockId, setNextBlockId] = useState(1);

	const generateRandomPosition = () => ({
		x: Math.random() * (window.innerWidth - 200),
		y: Math.random() * (window.innerHeight - 200),
	});

	const addBlock = useCallback(
		(parentId = null) => {
			const newBlockId = nextBlockId;
			const newPosition = generateRandomPosition();

			setBlocks((prevBlocks) => [
				...prevBlocks,
				{
					id: newBlockId,
					position: newPosition,
				},
			]);

			setBlockPositions((prev) => ({
				...prev,
				[newBlockId]: newPosition,
			}));

			if (parentId) {
				setBlockParents((prev) => ({
					...prev,
					[newBlockId]: parentId,
				}));
			}

			setNextBlockId((prev) => prev + 1);
		},
		[nextBlockId]
	);

	const removeBlock = useCallback((blockId) => {
		setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== blockId));

		setBlockPositions((prev) => {
			const newPositions = { ...prev };
			delete newPositions[blockId];
			return newPositions;
		});

		setBlockParents((prev) => {
			const newParents = { ...prev };
			delete newParents[blockId];
			return newParents;
		});
	}, []);

	const updateBlockPosition = useCallback((blockId, newPosition) => {
		setBlockPositions((prev) => ({
			...prev,
			[blockId]: newPosition,
		}));
	}, []);

	useEffect(() => {
		if (blocks.length === 0) {
			const initialPosition = generateRandomPosition();
			setBlocks([{ id: 1, position: initialPosition }]);
			setBlockPositions({ 1: initialPosition });
			setNextBlockId(2);
		}
	}, [blocks.length]);

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			{blocks.map((block) => (
				<Block
					key={block.id}
					block={block}
					onAddChild={addBlock}
					onRemoveBlock={removeBlock}
					onUpdatePosition={updateBlockPosition}
					parentPosition={blockParents[block.id] ? blockPositions[blockParents[block.id]] : null}
				/>
			))}
		</div>
	);
};

export default App;
