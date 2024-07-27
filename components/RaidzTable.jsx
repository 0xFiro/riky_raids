import { useState } from 'react';
import styles from "@/styles/Raids.module.css";
import Image from "next/image";
import raids from "@/raids.json";
import { useRouter } from 'next/router'

const RaidzTable = () => {
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const router = useRouter()

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const sortedRaids = [...raids].sort((a, b) => {
        if (sortBy === 'status') {
            if (a.status.toLowerCase() === b.status.toLowerCase()) {
                return 0;
            } else if (sortOrder === 'asc') {
                return a.status.toLowerCase() === 'ongoing' ? -1 : 1;
            } else {
                return a.status.toLowerCase() === 'ongoing' ? 1 : -1;
            }
        }
        switch (sortBy) {
            case 'stealValue':
                return sortOrder === 'asc' ? parseFloat(a.stealValue) - parseFloat(b.stealValue) : parseFloat(b.stealValue) - parseFloat(a.stealValue);
            case 'collectionSize':
                return sortOrder === 'asc' ? parseInt(a.collectionSize) - parseInt(b.collectionSize) : parseInt(b.collectionSize) - parseInt(a.collectionSize);
            default:
                return 0;
        }
    });

    return (
        <div className={styles.cont2}>
            <table className={styles.raidsTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Project</th>
                        <th onClick={() => handleSort('stealValue')}>Steal Value</th>
                        <th onClick={() => handleSort('collectionSize')}>Collection Size</th>
                        <th onClick={() => handleSort('status')}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRaids.map((e, index) => (
                        <tr onClick={() => router.push(`/${e.id}`)} key={index}>
                            <td><Image src={e.imageUrl} width={50} height={50} /></td>
                            <td>{e.project}</td>
                            <td>{e.stealValue}</td>
                            <td>{e.collectionSize}</td>
                            <td className={e.status === "Ongoing" ? styles.active : null}>{e.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RaidzTable;
