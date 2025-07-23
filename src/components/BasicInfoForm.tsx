import React, { useState, useEffect } from 'react'
import settingsStore from '@/features/stores/settings'

export type BasicInfo = {
  name: string
  sex: 'M' | 'F' | ''
  // birthDate: string
  age: number
  height: number
  weight: number
}

type Props = {
  onComplete: (data: BasicInfo) => void
}

export const BasicInfoForm = ({ onComplete }: Props) => {
  useEffect(() => {
    // 清除 basicProfile 內容
    settingsStore.setState({
      basicProfile: {
        name: '',
        sex: '',
        age: 0,
        height: 0,
        weight: 0,
      },
    })
  }, []) // 空依賴陣列表示只在組件掛載時執行一次

  const basicProfile = settingsStore((s) => s.basicProfile)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(basicProfile)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    settingsStore.setState({
      basicProfile: {
        ...basicProfile,
        [name]:
          name === 'age' || name === 'height' || name === 'weight'
            ? Number(value)
            : value,
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-1/2 ml-auto bg-white rounded-8 border border-gray-200 shadow-sm p-16"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-xs">
          姓名
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={basicProfile.name}
          onChange={handleChange}
          className="px-8 py-4 bg-[#eeeeee] rounded-8"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-xs">性別</label>
        <div className="flex justify-center gap-8 bg-[#eeeeee] p-4 rounded-8">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="sex"
              value="M"
              checked={basicProfile.sex === 'M'}
              onChange={handleChange}
              required
              className="w-5 h-5 text-primary"
            />
            <span className="pl-4">男生</span>
          </label>
          <label className="flex items-center gap-3 pl-16">
            <input
              type="radio"
              name="sex"
              value="F"
              checked={basicProfile.sex === 'F'}
              onChange={handleChange}
              required
              className="w-5 h-5 text-primary"
            />
            <span className="pl-4">女生</span>
          </label>
        </div>
      </div>

      {/* <div className="flex flex-col gap-2">
        <label htmlFor="birthDate" className="font-medium">
          出生年月日
        </label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          required
          value={basicProfile.birthDate}
          onChange={handleChange}
          className="p-2 border rounded-lg"
        />
      </div> */}
      <div className="flex flex-col gap-2">
        <label htmlFor="age" className="font-xs">
          年齡
        </label>
        <input
          type="number"
          id="age"
          name="age"
          required
          min="0"
          max="120"
          value={basicProfile.age || ''}
          onChange={handleChange}
          className="px-8 py-4 bg-[#eeeeee] rounded-8"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="height" className="font-xs">
          身高 (公分)
        </label>
        <input
          type="number"
          id="height"
          name="height"
          required
          min="0"
          max="300"
          value={basicProfile.height || ''}
          onChange={handleChange}
          className="px-8 py-4 bg-[#eeeeee] rounded-8"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="weight" className="font-xs">
          體重 (公斤)
        </label>
        <input
          type="number"
          id="weight"
          name="weight"
          required
          min="0"
          max="300"
          value={basicProfile.weight || ''}
          onChange={handleChange}
          className="px-8 py-4 bg-[#eeeeee] rounded-8"
        />
      </div>

      <div className="flex justify-end">
        <button
          id="basicInfoSubmit"
          type="submit"
          className="px-8 py-4 bg-primary text-white rounded-8 hover:bg-primary-hover mt-8"
        >
          完成基本資料
        </button>
      </div>
    </form>
  )
}
