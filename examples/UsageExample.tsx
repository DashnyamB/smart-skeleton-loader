import React, { useState, useEffect } from 'react';
import { AutoSkeleton } from '../src'; // Importing from local source

const UserProfile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setUser({
                name: 'Jane Doe',
                email: 'jane@example.com',
                avatar: 'https://via.placeholder.com/150'
            });
            setLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>AutoSkeleton Demo</h1>
            <button onClick={() => setLoading(!loading)}>
                Toggle Loading (Current: {loading ? 'ON' : 'OFF'})
            </button>

            <div style={{ marginTop: 20, border: '1px solid #ccc', padding: 20, maxWidth: 400 }}>
                {/* Verification of the wrapper */}
                <AutoSkeleton loading={loading}>
                    <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                        <img
                            src={user?.avatar || 'https://via.placeholder.com/150'}
                            alt="Avatar"
                            style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                            <h3 style={{ margin: 0, marginBottom: 5 }}>{user?.name || 'User Name Placeholder'}</h3>
                            <span style={{ color: 'gray' }}>{user?.email || 'email@example.com'}</span>
                        </div>
                    </div>
                    <div style={{ marginTop: 15 }}>
                        <p>
                            This is a description about the user. It might be multiple lines long.
                            The skeleton should match this text block size.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                            <button style={{ padding: '8px 16px', cursor: 'pointer' }}>View Profile</button>
                        </div>
                    </div>
                </AutoSkeleton>
            </div>
        </div>
    );
};

export default UserProfile;
