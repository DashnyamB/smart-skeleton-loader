import type { Meta, StoryObj } from '@storybook/react';
import { AutoSkeleton } from '../AutoSkeleton';
import React, { useState, useEffect } from 'react';

const meta = {
    title: 'Components/AutoSkeleton',
    component: AutoSkeleton,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        loading: { control: 'boolean' },
    },
} satisfies Meta<typeof AutoSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Reliable Base64 Placeholder
const IMG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23666666'%3EImage%3C/text%3E%3C/svg%3E";
const AVATAR_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23cccccc'/%3E%3C/svg%3E";

// Helper for Side-By-Side Comparison
const SideBySide = ({ children, args }: { children: React.ReactNode, args: any }) => (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
            <h4 style={{ marginBottom: 10, color: '#666', fontFamily: 'sans-serif' }}>Loading State (Skeleton)</h4>
            <AutoSkeleton {...args} loading={true}>
                {children}
            </AutoSkeleton>
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
            <h4 style={{ marginBottom: 10, color: '#666', fontFamily: 'sans-serif' }}>Loaded State (Actual)</h4>
            <AutoSkeleton {...args} loading={false}>
                {children}
            </AutoSkeleton>
        </div>
    </div>
);

// Basic Text Example
export const TextBlock: Story = {
    args: { loading: true, children: null },
    render: (args) => (
        <SideBySide args={args}>
            <div style={{ width: 400, fontFamily: 'sans-serif' }}>
                <h1>Heading Level 1</h1>
                <p>
                    This is a paragraph of text. It has multiple lines to demonstrate how the skeleton
                    will wrap around the text content. The skeleton should match the lines approximately
                    or cover the block.
                </p>
                <p>Another short paragraph.</p>
            </div>
        </SideBySide>
    )
};

// Image Card Example
export const ImageCard: Story = {
    args: { loading: true, children: null }, // Mock args to satisfy TS
    render: (args) => (
        <SideBySide args={args}>
            <div style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                overflow: 'hidden',
                width: 300,
                fontFamily: 'sans-serif'
            }}>
                <img
                    src={IMG_PLACEHOLDER}
                    alt="Cover"
                    style={{ width: '100%', height: 200, display: 'block' }}
                />
                <div style={{ padding: 16 }}>
                    <h3 style={{ marginTop: 0 }}>Card Title</h3>
                    <p style={{ color: '#666' }}>Some description text for the card.</p>
                    <button style={{
                        padding: '8px 16px',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}>Action</button>
                </div>
            </div>
        </SideBySide>
    )
};

// Form Inputs
export const FormInputs: Story = {
    args: { loading: true, children: null },
    render: (args) => (
        <SideBySide args={args}>
            <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 14, fontWeight: 500 }}>Email</label>
                    <input type="email" placeholder="john@example.com" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 14, fontWeight: 500 }}>Password</label>
                    <input type="password" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: 4 }}>Login</button>
                    <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: 4 }}>Forgot?</button>
                </div>
            </div>
        </SideBySide>
    )
}

// Config Customization
export const CustomColors: Story = {
    args: {
        loading: true,
        children: null,
        config: {
            color: '#ffc107',
            highlightColor: '#ffecb3',
            borderRadius: '12px'
        }
    },
    render: (args) => (
        <SideBySide args={args}>
            <div style={{ padding: 20, background: '#fff3cd', borderRadius: 12, fontFamily: 'sans-serif', width: 300 }}>
                <h2 style={{ marginTop: 0, color: '#856404' }}>Warning Message</h2>
                <p style={{ marginBottom: 0, color: '#856404' }}>This checks custom skeleton colors matching the alert theme.</p>
            </div>
        </SideBySide>
    )
}

// Interactive Toggle Demo
const InteractiveDemo = () => {
    const [loading, setLoading] = useState(true);
    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            <h3 style={{ marginBottom: 10 }}>Interactive Mode</h3>
            <button onClick={() => setLoading(!loading)} style={{ marginBottom: 20, padding: '8px 16px', cursor: 'pointer' }}>
                <span style={{ marginRight: 8 }}>{loading ? '⏹️' : '▶️'}</span>
                Toggle Loading: <strong>{loading ? "ON" : "OFF"}</strong>
            </button>
            <AutoSkeleton loading={loading}>
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    overflow: 'hidden',
                    width: 300,
                }}>
                    <img
                        src={IMG_PLACEHOLDER}
                        alt="Cover"
                        style={{ width: '100%', height: 150, display: 'block', objectFit: 'cover' }}
                    />
                    <div style={{ padding: 16 }}>
                        <h4 style={{ marginTop: 0 }}>Dynamic Content</h4>
                        <p style={{ color: '#666', fontSize: 14 }}>
                            Toggle the button above to see the transition between skeleton and content.
                        </p>
                    </div>
                </div>
            </AutoSkeleton>
        </div>
    );
};

export const Interactive: Story = {
    args: { loading: true, children: null },
    render: () => <InteractiveDemo />
};

// Data Fetching List Pattern
const DataFetchingDemo = () => {
    const [data, setData] = useState<any[] | null>(null);

    // Simulate fetch
    const fetchData = () => {
        setData(null); // Reset to loading
        setTimeout(() => {
            setData([
                { id: 1, title: 'Real Item 1', desc: 'Description for item 1', img: AVATAR_PLACEHOLDER },
                { id: 2, title: 'Real Item 2', desc: 'Description for item 2', img: AVATAR_PLACEHOLDER },
                { id: 3, title: 'Real Item 3', desc: 'Description for item 3', img: AVATAR_PLACEHOLDER },
            ]);
        }, 2000);
    };

    // Auto-fetch on mount
    React.useEffect(() => {
        fetchData();
    }, []);

    // The component we want to skeletonize
    const CardItem = ({ title, desc, img }: any) => (
        <div style={{
            display: 'flex',
            gap: 16,
            border: '1px solid #eee',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            fontFamily: 'sans-serif'
        }}>
            <img src={img} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} alt="" />
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0' }}>{title}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{desc}</p>
            </div>
            <button style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#eee', cursor: 'pointer' }}>View</button>
        </div>
    );

    return (
        <div style={{ width: 400 }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontFamily: 'sans-serif' }}>User List</h3>
                <button onClick={fetchData} style={{ padding: '6px 12px', cursor: 'pointer' }}>Refetch</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!data ? (
                    // LOADING STATE:
                    // Render "Template" items with dummy data wrapped in AutoSkeleton.
                    // This allows AutoSkeleton to measure the layout of an *actual* card.
                    Array.from({ length: 3 }).map((_, i) => (
                        <AutoSkeleton key={i} loading={true}>
                            <CardItem
                                title="Loading User Name"
                                desc="This is a placeholder description that simulates length."
                                img={AVATAR_PLACEHOLDER}
                            />
                        </AutoSkeleton>
                    ))
                ) : (
                    // LOADED STATE:
                    // Render actual data
                    data.map((item) => (
                        <CardItem key={item.id} {...item} />
                    ))
                )}
            </div>
        </div>
    );
};

export const DataFetchingList: Story = {
    args: { loading: true, children: null },
    render: () => <DataFetchingDemo />
};
