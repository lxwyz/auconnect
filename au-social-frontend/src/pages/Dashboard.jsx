import React from 'react'

const Dashboard = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
        <h1 className='text-2xl mb-4'>Welcome, User 1</h1>
        <p className='mb-4'>Student ID:</p>
        <button
         className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'>
            Logout
        </button>
    </div>
  )
}

export default Dashboard